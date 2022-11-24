# BHS Air Quality API

This is a read only API for the (around) 600 air quality sensors at the public Berkeley High School. It is made public to help educate myself about IoT, cloud systems and the impacts of air quality in the public school system. 

## API

Version 1 `/v1/` it hosted on the [Neon.tech](https://neon.tech/) on their very generous 10GB plan for Postgres. 

`GET /sensors`

Response: 

```json
[
	{
	"id": 1,
	"name": "BHS # C315",
	"mac": 1102830825,
	"room": "315",
	"building": "C"
	},
	{
	"id": 2,
	"name": "BHS # C204",
	"mac": 1102923505,
	"room": "204",
	"building": "C"
	},
	...
]

```

`GET /buildings `

```json 
[
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"M",
	"P"
]
```

`GET /building/:building/sensors`

Get all the sensors in a building in this case "c"

```json

[
	{
	"id": 25,
	"name": "BHS # C102",
	"mac": 1102923110,
	"room": "102",
	"building": "C"
	},
	{
	"id": 22,
	"name": "BHS # C105",
	"mac": 1103310918,
	"room": "105",
	"building": "C"
	},
	{
	"id": 7,
	"name": "BHS # C106",
	"mac": 1102831520,
	"room": "106",
	"building": "C"
	},
	...
]

```

`GET /sensor/:mac`

Get the sensor profile for a mac address `mac = 1102921932` 

```json 
[
	{
	"id": 20,
	"name": "BHS # C207",
	"mac": 1102921932,
	"room": "207",
	"building": "C"
	}
]
```

`GET /sensor/:mac/data?range=START_TIMESTAMP-END_TIMESTAMP` 

Get all types of sensor data for a range of data. Default returns the most recent 500 entries. 

Optionally return up to 500 within a range of timestamps.

`https://bhs.prangel.workers.dev/v1/sensor/1102921932/data`

```json 
[
	{
		"id": "2165157",
		"data": 5,
		"mac": 1102921932,
		"timestamp": "1669269512986",
		"type": 96
	},
	{
		"id": "2165158",
		"data": 409,
		"mac": 1102921932,
		"timestamp": "1669269510683",
		"type": 181
	},
	{
		"id": "2165159",
		"data": 49,
		"mac": 1102921932,
		"timestamp": "1669269510313",
		"type": 248
	},
	{
		"id": "2165156",
		"data": 64,
		"mac": 1102921932,
		"timestamp": "1669269509244",
		"type": 242
	},
	{
		"id": "2164536",
		"data": 1,
		"mac": 1102921932,
		"timestamp": "1669267702485",
		"type": 96
	}
]
```

`GET /sensor/:mac/data/:type?range=START_TIMESTAMP-END_TIMESTAMP` 

Get __one__ type of sensor data for a range of data. Default returns the most recent 500 entries. 

Optionally return up to 500 within a range of timestamps.

`https://bhs.prangel.workers.dev/v1/sensor/1102921932/data/181`

```json 
[
	{
		"id": "2165158",
		"data": 409,
		"mac": 1102921932,
		"timestamp": "1669269510683",
		"type": 181
	},
	{
		"id": "2164537",
		"data": 410,
		"mac": 1102921932,
		"timestamp": "1669267696896",
		"type": 181
	},
	{
		"id": "2163916",
		"data": 413,
		"mac": 1102921932,
		"timestamp": "1669265862797",
		"type": 181
	},
	{
		"id": "2163295",
		"data": 416,
		"mac": 1102921932,
		"timestamp": "1669264035545",
		"type": 181
	}
]
```



