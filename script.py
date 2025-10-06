import json
import matplotlib.pyplot as plt
from datetime import datetime
import matplotlib.dates as mdates

data = {
    "count": 100,
    "limit": 100,
    "offset": 0,
    "results": [
        {
            "id": "22766",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.06}",
            "received_at": "2025-09-09 00:33:11"
        },
        {
            "id": "22759",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.1}",
            "received_at": "2025-09-09 00:13:11"
        },
        {
            "id": "22754",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.79}",
            "received_at": "2025-09-08 23:53:11"
        },
        {
            "id": "22747",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.64}",
            "received_at": "2025-09-08 23:33:12"
        },
        {
            "id": "22740",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.64}",
            "received_at": "2025-09-08 23:13:12"
        },
        {
            "id": "22735",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.46}",
            "received_at": "2025-09-08 22:53:12"
        },
        {
            "id": "22728",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.4}",
            "received_at": "2025-09-08 22:33:12"
        },
        {
            "id": "22719",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.93}",
            "received_at": "2025-09-08 22:13:12"
        },
        {
            "id": "22713",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.19}",
            "received_at": "2025-09-08 21:53:12"
        },
        {
            "id": "22706",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.15}",
            "received_at": "2025-09-08 21:33:12"
        },
        {
            "id": "22699",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.15}",
            "received_at": "2025-09-08 21:13:12"
        },
        {
            "id": "22693",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.18}",
            "received_at": "2025-09-08 20:53:12"
        },
        {
            "id": "22687",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.19}",
            "received_at": "2025-09-08 20:33:12"
        },
        {
            "id": "22680",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.87}",
            "received_at": "2025-09-08 20:13:12"
        },
        {
            "id": "22674",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.57}",
            "received_at": "2025-09-08 19:53:12"
        },
        {
            "id": "22668",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.86}",
            "received_at": "2025-09-08 19:33:12"
        },
        {
            "id": "22661",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.52}",
            "received_at": "2025-09-08 19:13:12"
        },
        {
            "id": "22655",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.59}",
            "received_at": "2025-09-08 18:53:12"
        },
        {
            "id": "22646",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.09}",
            "received_at": "2025-09-08 18:33:11"
        },
        {
            "id": "22639",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.47}",
            "received_at": "2025-09-08 18:13:12"
        },
        {
            "id": "22631",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.14}",
            "received_at": "2025-09-08 17:53:12"
        },
        {
            "id": "22626",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.57}",
            "received_at": "2025-09-08 17:33:12"
        },
        {
            "id": "22620",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.42}",
            "received_at": "2025-09-08 17:13:12"
        },
        {
            "id": "22613",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.46}",
            "received_at": "2025-09-08 16:53:12"
        },
        {
            "id": "22606",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.13}",
            "received_at": "2025-09-08 16:33:12"
        },
        {
            "id": "22596",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.13}",
            "received_at": "2025-09-08 16:13:12"
        },
        {
            "id": "22590",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.17}",
            "received_at": "2025-09-08 15:53:12"
        },
        {
            "id": "22584",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.22}",
            "received_at": "2025-09-08 15:33:12"
        },
        {
            "id": "22578",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.55}",
            "received_at": "2025-09-08 15:13:12"
        },
        {
            "id": "22573",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.34}",
            "received_at": "2025-09-08 14:53:12"
        },
        {
            "id": "22567",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.24}",
            "received_at": "2025-09-08 14:33:12"
        },
        {
            "id": "22561",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.27}",
            "received_at": "2025-09-08 14:13:12"
        },
        {
            "id": "22556",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.25}",
            "received_at": "2025-09-08 13:53:12"
        },
        {
            "id": "22550",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.42}",
            "received_at": "2025-09-08 13:33:12"
        },
        {
            "id": "22544",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.76}",
            "received_at": "2025-09-08 13:13:12"
        },
        {
            "id": "22538",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.96}",
            "received_at": "2025-09-08 12:53:12"
        },
        {
            "id": "22532",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 8.13}",
            "received_at": "2025-09-08 12:33:12"
        },
        {
            "id": "22525",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.02}",
            "received_at": "2025-09-08 12:13:12"
        },
        {
            "id": "22516",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.06}",
            "received_at": "2025-09-08 11:53:12"
        },
        {
            "id": "22510",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.76}",
            "received_at": "2025-09-08 11:33:12"
        },
        {
            "id": "22503",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.35}",
            "received_at": "2025-09-08 11:13:12"
        },
        {
            "id": "22496",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.8}",
            "received_at": "2025-09-08 10:53:12"
        },
        {
            "id": "22490",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.47}",
            "received_at": "2025-09-08 10:33:12"
        },
        {
            "id": "22483",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.62}",
            "received_at": "2025-09-08 10:13:12"
        },
        {
            "id": "22477",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.26}",
            "received_at": "2025-09-08 09:53:12"
        },
        {
            "id": "22471",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.4}",
            "received_at": "2025-09-08 09:33:12"
        },
        {
            "id": "22464",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.1}",
            "received_at": "2025-09-08 09:13:12"
        },
        {
            "id": "22458",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.04}",
            "received_at": "2025-09-08 08:53:12"
        },
        {
            "id": "22452",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.01}",
            "received_at": "2025-09-08 08:33:12"
        },
        {
            "id": "22444",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.1}",
            "received_at": "2025-09-08 08:13:12"
        },
        {
            "id": "22438",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.76}",
            "received_at": "2025-09-08 07:53:12"
        },
        {
            "id": "22432",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.4}",
            "received_at": "2025-09-08 07:33:12"
        },
        {
            "id": "22424",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.82}",
            "received_at": "2025-09-08 07:13:12"
        },
        {
            "id": "22415",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.45}",
            "received_at": "2025-09-08 06:53:12"
        },
        {
            "id": "22409",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.9}",
            "received_at": "2025-09-08 06:33:12"
        },
        {
            "id": "22402",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.7}",
            "received_at": "2025-09-08 06:13:13"
        },
        {
            "id": "22397",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.63}",
            "received_at": "2025-09-08 05:53:13"
        },
        {
            "id": "22387",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 4.44}",
            "received_at": "2025-09-08 05:33:13"
        },
        {
            "id": "22380",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.74}",
            "received_at": "2025-09-08 05:13:13"
        },
        {
            "id": "22375",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.04}",
            "received_at": "2025-09-08 04:53:13"
        },
        {
            "id": "22369",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.54}",
            "received_at": "2025-09-08 04:33:13"
        },
        {
            "id": "22363",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.21}",
            "received_at": "2025-09-08 04:13:13"
        },
        {
            "id": "22358",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.24}",
            "received_at": "2025-09-08 03:53:13"
        },
        {
            "id": "22350",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.97}",
            "received_at": "2025-09-08 03:33:13"
        },
        {
            "id": "22344",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.72}",
            "received_at": "2025-09-08 03:13:13"
        },
        {
            "id": "22339",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.63}",
            "received_at": "2025-09-08 02:53:13"
        },
        {
            "id": "22332",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.04}",
            "received_at": "2025-09-08 02:33:13"
        },
        {
            "id": "22326",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.66}",
            "received_at": "2025-09-08 02:13:13"
        },
        {
            "id": "22320",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.22}",
            "received_at": "2025-09-08 01:53:13"
        },
        {
            "id": "22313",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.23}",
            "received_at": "2025-09-08 01:33:13"
        },
        {
            "id": "22307",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.25}",
            "received_at": "2025-09-08 01:13:13"
        },
        {
            "id": "22301",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.29}",
            "received_at": "2025-09-08 00:53:13"
        },
        {
            "id": "22293",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.9}",
            "received_at": "2025-09-08 00:33:13"
        },
        {
            "id": "22287",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.31}",
            "received_at": "2025-09-08 00:13:13"
        },
        {
            "id": "22281",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.92}",
            "received_at": "2025-09-07 23:53:13"
        },
        {
            "id": "22274",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.42}",
            "received_at": "2025-09-07 23:33:13"
        },
        {
            "id": "22268",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.64}",
            "received_at": "2025-09-07 23:13:13"
        },
        {
            "id": "22262",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.42}",
            "received_at": "2025-09-07 22:53:13"
        },
        {
            "id": "22254",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.22}",
            "received_at": "2025-09-07 22:33:13"
        },
        {
            "id": "22247",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.27}",
            "received_at": "2025-09-07 22:13:13"
        },
        {
            "id": "22241",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.28}",
            "received_at": "2025-09-07 21:53:13"
        },
        {
            "id": "22234",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.92}",
            "received_at": "2025-09-07 21:33:13"
        },
        {
            "id": "22228",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.33}",
            "received_at": "2025-09-07 21:13:13"
        },
        {
            "id": "22222",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.83}",
            "received_at": "2025-09-07 20:53:13"
        },
        {
            "id": "22213",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.05}",
            "received_at": "2025-09-07 20:33:13"
        },
        {
            "id": "22207",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.85}",
            "received_at": "2025-09-07 20:13:13"
        },
        {
            "id": "22201",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.39}",
            "received_at": "2025-09-07 19:53:13"
        },
        {
            "id": "22192",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.56}",
            "received_at": "2025-09-07 19:33:13"
        },
        {
            "id": "22186",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.97}",
            "received_at": "2025-09-07 19:13:13"
        },
        {
            "id": "22180",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.44}",
            "received_at": "2025-09-07 18:53:13"
        },
        {
            "id": "22171",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.16}",
            "received_at": "2025-09-07 18:33:13"
        },
        {
            "id": "22165",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.26}",
            "received_at": "2025-09-07 18:13:13"
        },
        {
            "id": "22160",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.31}",
            "received_at": "2025-09-07 17:53:13"
        },
        {
            "id": "22153",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.13}",
            "received_at": "2025-09-07 17:33:13"
        },
        {
            "id": "22147",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.1}",
            "received_at": "2025-09-07 17:13:13"
        },
        {
            "id": "22140",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.83}",
            "received_at": "2025-09-07 16:53:13"
        },
        {
            "id": "22134",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 7.03}",
            "received_at": "2025-09-07 16:33:13"
        },
        {
            "id": "22123",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.72}",
            "received_at": "2025-09-07 16:13:13"
        },
        {
            "id": "22116",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 6.63}",
            "received_at": "2025-09-07 15:53:13"
        },
        {
            "id": "22110",
            "device_id": "dragino-ltc2-fsa-5cf250",
            "payload": "{\"battery\": 100, \"temperature\": 5.51}",
            "received_at": "2025-09-07 15:33:13"
        }
    ]
}

# Listas para armazenar dados
timestamps = []
temperatures = []

for entry in data["results"]:
    payload = json.loads(entry["payload"])  # Converte string JSON para dicionário
    temperature = payload.get("temperature")
    timestamp = datetime.strptime(entry["received_at"], "%Y-%m-%d %H:%M:%S")
    
    temperatures.append(temperature)
    timestamps.append(timestamp)

# Criar gráfico mais bonito
plt.style.use("fivethirtyeight")  # estilo moderno

plt.figure(figsize=(14, 7))
plt.plot(
    timestamps, temperatures,
    marker="o", markersize=6, linewidth=2,
    color="#1f77b4", label="Temperatura"
)

# Destacar pontos máximos e mínimos
max_temp = max(temperatures)
min_temp = min(temperatures)
plt.scatter(
    [timestamps[temperatures.index(max_temp)]], [max_temp],
    color="red", s=120, zorder=5, label=f"Máx: {max_temp:.2f}°C"
)
plt.scatter(
    [timestamps[temperatures.index(min_temp)]], [min_temp],
    color="blue", s=120, zorder=5, label=f"Mín: {min_temp:.2f}°C"
)

# Formatação do eixo X
plt.gca().xaxis.set_major_formatter(mdates.DateFormatter("%d/%m %Hh"))
plt.gca().xaxis.set_major_locator(mdates.AutoDateLocator())

# Títulos e legendas
plt.title("Leituras de Temperatura do Sensor", fontsize=18, weight="bold")
plt.xlabel("Data/Hora", fontsize=14)
plt.ylabel("Temperatura (°C)", fontsize=14)
plt.legend(fontsize=12)
plt.xticks(rotation=45)
plt.tight_layout()

plt.show()