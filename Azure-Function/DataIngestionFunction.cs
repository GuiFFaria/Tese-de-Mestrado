
using Azure;
using Azure.DigitalTwins.Core;
using Azure.Identity;
using Azure.Messaging.EventGrid;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Threading.Tasks;

namespace DataIngestion.Function
{
    public static class DataIngestionFunction
    {
        private static readonly string adtInstanceUrl = Environment.GetEnvironmentVariable("ADT_SERVICE_URL");

        [Function("DataIngestionFunction")]
        public static async Task Run([EventGridTrigger] EventGridEvent eventGridEvent, FunctionContext context)
        {
            var log = context.GetLogger("DataIngestionFunction");
            // Verifica se a URL do Azure Digital Twins está configurada
             if (adtInstanceUrl == null)
            {
                log.LogError("Application setting 'ADT_SERVICE_URL' is not set.");
                return;
            }

            try
            {
                var cred = new DefaultAzureCredential();
                var client = new DigitalTwinsClient(new Uri(adtInstanceUrl), cred);
                log.LogInformation("Conexão com Azure Digital Twins criada.");

                JObject deviceMessage = (JObject)JsonConvert.DeserializeObject(eventGridEvent.Data.ToString());
                string deviceId = deviceMessage["systemProperties"]?["iothub-connection-device-id"]?.ToString();
                JObject body = (JObject)deviceMessage["body"];

                if (deviceId == null || body == null)
                {
                    log.LogWarning("Mensagem sem deviceId ou body.");
                    return;
                }

                // Obter o modelId do corpo da mensagem
                string modelId = body["model"]?.ToString();
                if (string.IsNullOrEmpty(modelId))
                {
                    log.LogWarning($"Modelo não especificado para o dispositivo {deviceId}.");
                    return;
                }

                // Verificar se o twin já existe
                try
                {
                    await client.GetDigitalTwinAsync<BasicDigitalTwin>(deviceId);
                }
                catch (RequestFailedException ex) when (ex.Status == 404)
                {
                    log.LogWarning($"Twin '{deviceId}' não encontrado. Criando novo twin.");
                }

                // Atualizar propriedades
                var patch = new JsonPatchDocument();
                foreach (var prop in body.Properties())
                {
                    if (prop.Name == "model") continue; // ignora o campo model

                    if (prop.Value.Type == JTokenType.Float || prop.Value.Type == JTokenType.Integer || prop.Value.Type == JTokenType.String)
                    {
                        patch.AppendReplace($"/{prop.Name}", prop.Value);
                    }
                }

                await client.UpdateDigitalTwinAsync(deviceId, patch);
                log.LogInformation($"Twin '{deviceId}' atualizado com sucesso.");
            }
            catch (Exception ex)
            {
                log.LogError($"Erro ao processar mensagem: {ex.Message}");
            }
        }
    }
}
