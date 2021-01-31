---
title: Victron Energy VRM / CCGX Daten lokal auslesen
description: Victron Energy VRM / Daten CCGX Daten lokal auslesen
introimage: "/images/projekte/ccgx_600.gif"
type: projekte
lang: de-DE
published: 31.03.2020
sitemap:
  exclude: false
  changefreq: monthly
---
# Victron Energy VRM / CCGX Daten lokal auslesen
<TOC />

![L1](/images/projekte/ccgx_600.gif)

## Problemstellung

Meine heimische Solaranlage verfügt über einen elektronischen Wechselstrom Zähler und eine Batterie. Die Batterieladung bzw -entladung erfolgt voll automatisch und wird über den Color Control GC (CCGX) geregelt. Die Strombezugsdaten hätte ich gerne zusätzlich zum VRM Portal auch direkt in meiner lokalen influxDB um diese mit Grafana auszuwerten.

## Hardware

- Color Control GX
- MultiGrid 48/3000/35-50
- Energy Meter ET340
- 4 x PYLONTECH LiFePO4 48Volt 2,4kWh

## These

Der CCGX verfügt über einen :MQTT: Broker und telegraf könnte sich auf die entsprechenden Topics anmelden und in eine InfluxDB schreiben lassen. Um die These zu testen und zu sehen ob die richtigen Daten bereitgestellt werden können fertige Docker Images verwendet werden. Eine detaillierte Anleitung ist auf [Github](https://github.com/victronenergy/venus-docker-grafana) zu finden, war innerhalb von Minuten eingerichtet und brachte genau die Daten zu Tage, welche ich erhofft hatte.

## Experiment

### Topic Struktur verstehen

Mit dem topic '#' werde alle Nachrichten angezeigt.

```shell
mosquitto_sub -v -I myclient_ -t "#" -h 192.168.0.201 

N/XXXXXXXXXXX/system/0/Serial {"value": "XXXXXXXXXXX"}
N/XXXXXXXXXXX/system/0/Ac/ActiveIn/Source {"value": 1}
N/XXXXXXXXXXX/system/0/Ac/Consumption/L1/Power {"value": 251.60000000000002}
N/XXXXXXXXXXX/system/0/Ac/Consumption/L2/Power {"value": 565.0}
N/XXXXXXXXXXX/system/0/Ac/Consumption/L3/Power {"value": 137.5}
N/XXXXXXXXXXX/system/0/Ac/Consumption/NumberOfPhases {"value": 3}
N/XXXXXXXXXXX/system/0/Ac/ConsumptionOnInput/L1/Power {"value": 20.600000000000023}
N/XXXXXXXXXXX/system/0/Ac/ConsumptionOnInput/L2/Power {"value": 565.0}
N/XXXXXXXXXXX/system/0/Ac/ConsumptionOnInput/L3/Power {"value": 137.5}
N/XXXXXXXXXXX/system/0/Ac/ConsumptionOnInput/NumberOfPhases {"value": 3}
N/XXXXXXXXXXX/system/0/Ac/ConsumptionOnOutput/L1/Power {"value": 231}
N/XXXXXXXXXXX/system/0/Ac/ConsumptionOnOutput/L2/Power {"value": null}
N/XXXXXXXXXXX/system/0/Ac/ConsumptionOnOutput/L3/Power {"value": null}
N/XXXXXXXXXXX/system/0/Ac/ConsumptionOnOutput/NumberOfPhases {"value": 1}
N/XXXXXXXXXXX/system/0/Ac/Genset/DeviceType {"value": null}
N/XXXXXXXXXXX/system/0/Ac/Genset/L1/Power {"value": null}
N/XXXXXXXXXXX/system/0/Ac/Genset/L2/Power {"value": null}
N/XXXXXXXXXXX/system/0/Ac/Genset/L3/Power {"value": null}
N/XXXXXXXXXXX/system/0/Ac/Genset/NumberOfPhases {"value": null}
N/XXXXXXXXXXX/system/0/Ac/Genset/ProductId {"value": null}
N/XXXXXXXXXXX/system/0/Ac/Grid/DeviceType {"value": 345}
N/XXXXXXXXXXX/system/0/Ac/Grid/L1/Power {"value": 260.60000000000002}
N/XXXXXXXXXXX/system/0/Ac/Grid/L2/Power {"value": 565.0}
N/XXXXXXXXXXX/system/0/Ac/Grid/L3/Power {"value": 137.5}
N/XXXXXXXXXXX/system/0/Ac/Grid/NumberOfPhases {"value": 3}
N/XXXXXXXXXXX/system/0/Ac/Grid/ProductId {"value": 45069}
...

mosquitto_sub -v -I myclient_ -t "#" -h 192.168.0.201 > test.out
cat test.out|awk '{print $1}'|sort -u|wc -l
529

```

Da es zu viel ist, um es als Mensch sinnvoll überblicken zu können, ein etwas strukturierterer Ansatz

```shell
cat test.out |awk -F '/' '{print $3}'|sort -u
battery
fronius
grid
hub4
logger
settings
system
vebus

grep grid test.out|cut -d " " -f 1|sort -u
N/XXXXXXXXXXX/grid/30/Ac/Current
N/XXXXXXXXXXX/grid/30/Ac/Energy/Forward
N/XXXXXXXXXXX/grid/30/Ac/Energy/Reverse
N/XXXXXXXXXXX/grid/30/Ac/L1/Current
N/XXXXXXXXXXX/grid/30/Ac/L1/Energy/Forward
N/XXXXXXXXXXX/grid/30/Ac/L1/Energy/Reverse
N/XXXXXXXXXXX/grid/30/Ac/L1/Power
N/XXXXXXXXXXX/grid/30/Ac/L1/Voltage
N/XXXXXXXXXXX/grid/30/Ac/L2/Current
N/XXXXXXXXXXX/grid/30/Ac/L2/Energy/Forward
N/XXXXXXXXXXX/grid/30/Ac/L2/Energy/Reverse
N/XXXXXXXXXXX/grid/30/Ac/L2/Power
N/XXXXXXXXXXX/grid/30/Ac/L2/Voltage
N/XXXXXXXXXXX/grid/30/Ac/L3/Current
N/XXXXXXXXXXX/grid/30/Ac/L3/Energy/Forward
N/XXXXXXXXXXX/grid/30/Ac/L3/Energy/Reverse
N/XXXXXXXXXXX/grid/30/Ac/L3/Power
N/XXXXXXXXXXX/grid/30/Ac/L3/Voltage
N/XXXXXXXXXXX/grid/30/Ac/Power
N/XXXXXXXXXXX/grid/30/Ac/Voltage
N/XXXXXXXXXXX/grid/30/Connected
N/XXXXXXXXXXX/grid/30/CustomName
N/XXXXXXXXXXX/grid/30/DeviceInstance
N/XXXXXXXXXXX/grid/30/DeviceType
N/XXXXXXXXXXX/grid/30/ErrorCode
N/XXXXXXXXXXX/grid/30/FirmwareVersion
N/XXXXXXXXXXX/grid/30/Mgmt/Connection
N/XXXXXXXXXXX/grid/30/Mgmt/ProcessName
N/XXXXXXXXXXX/grid/30/Mgmt/ProcessVersion
N/XXXXXXXXXXX/grid/30/ProductId
N/XXXXXXXXXXX/grid/30/ProductName
N/XXXXXXXXXXX/grid/30/Serial
N/XXXXXXXXXXX/settings/0/Settings/CGwacs/Devices/D318375A/ServiceType
N/XXXXXXXXXXX/system/0/ServiceMapping/com_victronenergy_grid_30

grep "/battery" test.out|cut -d " " -f 1|sort -u
N/XXXXXXXXXXX/battery/512/Alarms/CellImbalance
N/XXXXXXXXXXX/battery/512/Alarms/HighChargeCurrent
N/XXXXXXXXXXX/battery/512/Alarms/HighChargeTemperature
N/XXXXXXXXXXX/battery/512/Alarms/HighDischargeCurrent
N/XXXXXXXXXXX/battery/512/Alarms/HighTemperature
N/XXXXXXXXXXX/battery/512/Alarms/HighVoltage
N/XXXXXXXXXXX/battery/512/Alarms/InternalFailure
N/XXXXXXXXXXX/battery/512/Alarms/LowChargeTemperature
N/XXXXXXXXXXX/battery/512/Alarms/LowTemperature
N/XXXXXXXXXXX/battery/512/Alarms/LowVoltage
N/XXXXXXXXXXX/battery/512/Connected
N/XXXXXXXXXXX/battery/512/Dc/0/Current
N/XXXXXXXXXXX/battery/512/Dc/0/Power
N/XXXXXXXXXXX/battery/512/Dc/0/Temperature
N/XXXXXXXXXXX/battery/512/Dc/0/Voltage
N/XXXXXXXXXXX/battery/512/DeviceInstance
N/XXXXXXXXXXX/battery/512/FirmwareVersion
N/XXXXXXXXXXX/battery/512/Info/BatteryLowVoltage
N/XXXXXXXXXXX/battery/512/Info/MaxChargeCurrent
N/XXXXXXXXXXX/battery/512/Info/MaxChargeVoltage
N/XXXXXXXXXXX/battery/512/Info/MaxDischargeCurrent
N/XXXXXXXXXXX/battery/512/Mgmt/Connection
N/XXXXXXXXXXX/battery/512/ProductId
N/XXXXXXXXXXX/battery/512/ProductName
N/XXXXXXXXXXX/battery/512/Redetect
N/XXXXXXXXXXX/battery/512/Soc
N/XXXXXXXXXXX/battery/512/Soh

```

Es gibt pro Phase (L1, L2, L3) ein eignes Topic und zusätzliche ein Topic saldiert (N/XXXXXXXXXXX/grid/30/Ac/Current), jeweils gefolgt von dem aktuellen Wert "{value: XXX}". Daher muss im Telegraf jedes Topic einzeln angelegt werden, um eine Zuordnung der Werte zu ermöglichen.
 
Die Batterie Daten sehen auch sehr vielversprechend aus und neben den Stromwerten gibt es auch "State of Charge" (Soc) und "State of Health" (Soh).

### Telegraf Konfiguration

Um die bestehende Telegraf konfiguration nicht zu gefährden und da es mir bisher nicht gelungen war, 2 unterschiedliche MQTT broker in einer telegraf Instanz zu konfigurieren, erstellen wir eine neue Konfiguration um einen zweite telegraf Instanz damit zu starten.

**/etc/telegraf/telegraf_vrm.conf**
```ini
[agent]
  interval = "10s"
  round_interval = true
  metric_batch_size = 1000
  metric_buffer_limit = 10000
  collection_jitter = "0s"
  flush_interval = "10s"
  flush_jitter = "0s"
  precision = ""
  logtarget = "file"
  logfile = "/var/log/telegraf/telegraf-vrm.log"
  logfile_rotation_max_size = "10MB"
  logfile_rotation_max_archives = 5
  omit_hostname = true

[[outputs.influxdb]]
  urls = ["http://127.0.0.1:8086"]
  database = "vrm"
  user_agent = "telegraf-vrm"

[[inputs.mqtt_consumer]]
   servers = ["tcp://192.168.0.201:1883"]
   topics = [
     "N/+/grid/30/Ac/Power",
     "N/+/grid/30/Ac/Current",
     "N/+/grid/30/Ac/Voltage",
     "N/+/system/0/Ac/Consumption/L1/Power",
     "N/+/system/0/Ac/Consumption/L2/Power",
     "N/+/system/0/Ac/Consumption/L3/Power",
     "N/+/grid/30/Ac/L1/Power",
     "N/+/grid/30/Ac/L1/Current",
     "N/+/grid/30/Ac/L1/Voltage",
     "N/+/grid/30/Ac/L2/Power",
     "N/+/grid/30/Ac/L2/Current",
     "N/+/grid/30/Ac/L2/Voltage",
     "N/+/grid/30/Ac/L3/Power",
     "N/+/grid/30/Ac/L3/Current",
     "N/+/grid/30/Ac/L3/Voltage",
     "N/+/battery/512/Soc",
     "N/+/battery/512/Soh",
     "N/+/battery/512/Dc/0/Current",
     "N/+/battery/512/Dc/0/Power",
     "N/+/battery/512/Dc/0/Temperature",
     "N/+/battery/512/Dc/0/Voltage"
   ]
   data_type = "float"
   data_format = "json"
   persistent_session = false
   client_id = "telegraf-vrm"

```

```shell
/usr/bin/telegraf -config /etc/telegraf/telegraf_vrm.conf --debug
```

Während der Tests scheint es notwendig zu sein **persistent_session = false** zu setzen, da telegraf ansonsten beim Neustart die alte Session nur aufnimmt, und nicht die konfigurierten Topics an den broker übermittelt. Im Betrieb kann man das aber wieder auf **true** stellen, so dass bei einem Verbindungsabbruch die Daten nicht verloren gehen.

Um den MQTT Broker aktiv zu halten, muss regelmäßig eine Art keep-alive gesendet werden. Hierzu verwende ich folgenden cronjob.
```
* * * * * /usr/bin/mosquitto_pub  -m '' -t 'R/XXXXXXXXXXX/system/0/Serial' -h 192.168.0.201
```

### Telegraf Service einrichten

**/etc/systemd/system/telegraf-vrm.service**
```ini
[Unit]
Description=The plugin-driven server agent for reporting metrics into InfluxDB
Documentation=https://github.com/influxdata/telegraf
After=network.target

[Service]
EnvironmentFile=-/etc/default/telegraf
User=telegraf
ExecStart=/usr/bin/telegraf -config /etc/telegraf/telegraf_vrm.conf $TELEGRAF_OPTS
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartForceExitStatus=SIGPIPE
KillMode=control-group

[Install]
WantedBy=multi-user.target
```

```shell
systemctl daemon-reload
systemctl enable telegraf-vrm
systemctl start telegraf-vrm
systemctl status telegraf-vrm
● telegraf-vrm.service - The plugin-driven server agent for reporting metrics into InfluxDB
   Loaded: loaded (/etc/systemd/system/telegraf-vrm.service; enabled; vendor preset: enabled)
   Active: active (running) since Mon 2020-03-30 20:33:00 BST; 24h ago
     Docs: https://github.com/influxdata/telegraf
 Main PID: 19749 (telegraf)
    Tasks: 14 (limit: 2053)
   Memory: 10.6M
   CGroup: /system.slice/telegraf-vrm.service
           └─19749 /usr/bin/telegraf -config /etc/telegraf/telegraf_vrm.conf

Warning: Journal has been rotated since unit was started. Log output is incomplete or unavailable.
```

## Das Ergebnis
Ab sofort habe ich kontinuierlich Daten über den Zustand der Batterie und über den Verbrauch des selbst erzeugten Stroms. Bei der Betrachtung der ersten Daten konnte ich schon eine kleine Konfigurationsanpassung durchführen, bei der ich den "Grid setpoint" von 160W auf 120W reduziert habe. Das heisst, das bis zu 120W aus dem Netz geszogen werden, aber alle darüber hinaus produzierte Solarenergie, in der Batterie gespeichert wird. Da ich 100% Eigenverbrauch anstrebe, ist das notwendig um bei Wolken dem Gerät genug Zeit zu geben den Laderegeler zu justieren. Zusätzlich habe ich die "Maximum Inverter Power" auf von 250W auf 500W gestellt. In dem betrachtetem Zeitraum, wurde nur einmal, kurz Strom in das Netz eingespeist. 

**Batterie Zustand**
![Batterie Zustand](/images/projekte/ccgx_batterie.png)

**Stromverbrauch**
![grid](/images/projekte/ccgx_grid.png)

**Phase L1 Einspeisung vs Verbrauch**
![L1](/images/projekte/ccgx_L1.png)

Sollte ich in Zukunft mit dem Portal von Victron Energy unzufrieden sein, kann ich jederzeit das Senden der Daten dorthin abschalten und dann nur noch mit meinen lokalen Daten weiter arbeiten. Zusätzlich bin ich nicht mehr von der Retention Policy auf dem VRM Portal angewiesen, bei dem derezeit alle Daten nach 12 Monaten gelöscht werden. Dies ist allgemein ungünstig, da einen Jahr über Jahr Betrachtung erst nach 13 Monaten möglich ist und der eine Monate längere Speicherung kein wirkliches Problem darstellen sollten, aber einen enormen Mehrwert bietet. Ich habe bisher keine Data Rentention Policy in der InfluxDB angelegt und werde hiermit auch abwarten um zu sehen ob das überhaupt ein Problem bei meiner lokalen Installation wird.

Grosses Lob an Victron Energy für eine vorzügliche Integrierbarkeit und insbesondere für die Bereitstellung eines fertigen docker/grafana Systems.
