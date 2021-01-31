---
title: Grafana
description: Grafana in Verbindung mit InfluxDB und Telegraf/MQTT bildet die Ausgangsbasis für die eigene IoT Landschaft, losgelöst von den diversen Gerätehersteller Portalen.
introimage: "/images/grafana-logo.png"
author: Sascha Curth
type: article
lang: de-DE
published: 26.02.2020
sitemap:
  exclude: false
  changefreq: monthly
---
# Inhalt
<TOC />
# In einem Satz
Grafana in Verbindung mit InfluxDB und Telegraf/MQTT bilden die Ausgangsbasis für die eigene IoT Landschaft, losgelöst von den diversen Gerätehersteller Portalen.

## Überblick
Mit Grafana können Zeitreihen von Zahlenwerten graphisch dargestellt werden und ermöglichen es Trends zu erkennen und bei erreichen von Schwellwerten zu alarmieren. Grafana verfügt über viele Möglichkeiten auf externe Datenquellen zuzugreifen und die Daten entsprechend zu visualisieren. Grafana bietet keine Möglichkeit die Daten aktuell zu halten und ist hierfür auf andere Prozesse angewiesen, wie beispielsweise Telegraf oder cronjobs.

### InfluxDB
Diese Datenbank ist speziell für Zeitreihen optimiert und erfordert wenig Kenntnissie für eine erste inbetriebnahme für ein privates IoT Monitoring Projekt. Einige Hersteller bieten eine native InfluxDB Integration an, so dass diese Geräte die Daten direkt dort abspeichern und Grafana diese dann auswerten kann.

### Telegraf
Telegraf ist ein Daten Kollektor, der mittels verschiedener Plugins die Daten periodisch holen, aufbereiten und in die InfluxDB speichern kann.

### MQTT
Grafana kann nicht direkt Daten via MQTT holen, da es selbst keine Daten speichert. Hier kommt Telegraf ins Spiel, welcher sich via MQTT an die entsprechenden Topics registireren kann und dann wiederum die InfluxDB befüllt.

### Andere Alternativen
Neben InfluxDB & Telegraf kann zum Beispiel auch Prometheus und Tanos verwendet werden. Eine Liste von Datenquellen findet man auf der <a href="https://grafana.com/grafana/plugins?orderBy=weight&direction=asc&type=datasource" target=_grafana>Grafana Plugin Seite</a>. Auch einfache scripte die mittels cron ausgeführt werden können zum gewünschten Ergebnis führen.

## Quick & Dirty
```shell
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list

sudo apt-get install grafana
sudo /bin/systemctl enable grafana-server
sudo service grafana-server restart
```
Danach läuft Grafana auf dem Port 3000 und ist mittels browser erreichbar.

## Grafana Installation mittels Docker

## Datensicherung

## Versions Upgrade

## Telegraf als Service anlegen
Da man pro Telegraf Daemon nur eine InfluxDB Datenbank angeben kann, ist es empfehlenswert die unterschiedlichen MQTT Themen auf verschiedene Telegraf Instanzen zu verteilen. Beispiel:
```
ls -l /etc/systemd/system/telegraf-*
-rw-r--r-- 1 root root 457 Jun 11 21:03 /etc/systemd/system/telegraf-miflora.service
-rw-r--r-- 1 root root 461 Jul 16 14:21 /etc/systemd/system/telegraf-tinkerforge.service
-rw-r--r-- 1 root root 453 Mar 30 20:30 /etc/systemd/system/telegraf-vrm.service

grep -i ExecStart telegraf-*
telegraf-miflora.service:ExecStart=/usr/bin/telegraf -config /etc/telegraf/telegraf_miflora.conf $TELEGRAF_OPTS
telegraf-tinkerforge.service:ExecStart=/usr/bin/telegraf -config /etc/telegraf/telegraf_tinkerforge.conf $TELEGRAF_OPTS
telegraf-vrm.service:ExecStart=/usr/bin/telegraf -config /etc/telegraf/telegraf_vrm.conf $TELEGRAF_OPTS

```

Jeder Service kann nun eine eigene InfluxDB als Backend verwenden, z.b.:
```ini
[global_tags]
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
  logfile = "/var/log/telegraf/telegraf-tinkerforge.log"
  hostname = ""
  omit_hostname = false
[[outputs.influxdb]]
  urls = ["http://127.0.0.1:8086"]
  database = "tinkerforge"
[[inputs.mqtt_consumer]]
   servers = [
     "tcp://127.0.0.1:1883"
   ]
   persistent_session = false
   client_id = "telegraf-tinkerforge"
   topics = [
     "tinkerforge/callback/uv_light_v2_bricklet/GPX/uvi",
     "tinkerforge/callback/uv_light_v2_bricklet/GPX/uva",
     "tinkerforge/callback/uv_light_v2_bricklet/GPX/uvb",
     "tinkerforge/callback/outdoor_weather_bricklet/Es6/station_data",
     "tinkerforge/callback/air_quality_bricklet/Jyf/all_values",
     "tinkerforge/callback/industrial_dual_0_20ma_v2_bricklet/JhA/current"
   ]
   data_format = "json"
```


## Alarm einrichten am Beispiel von Telegram
Um Telegram als Alarm Kanal zu nuzten sind folgende Schritte notwendig
- Telegram Account einrichten
- Telegram bot anlegen
- Telegram Channel anlegen
- Grafana Alarm Kanal einrichten
- Alarm für einen Wert konfigurieren

### Telegram Account
App auf dem Telefon installieren, mit der Nummer registrieren und den Code aus der Bestätigungs SMS eingeben. Im Anschluss am besten auch die Applikation auf dem Rechner installieren um das Kopieren des Token zu vereinfachen. Bei der Account Erstellung erhalten alle Telegram Nutzer, die eure Telefonnummer im Adressbuch haben eine Nachricht das ihr jetzt auch Telegram nutzt. Inhaltlich finde ich das falsch, da ich darüber bestimmen möchte, ob und wer diese Information bekommt.

### Bot anlegen
Der Prozess ist auf der Seite von <a href="https://core.telegram.org/bots#6-botfather" targe=_telegram>Telegram</a> gut dokumentiert.

### Telegram Channel erstellen
Die Nachrichten werden mittels des eben angelegten Bot an einen Channel ausgeliefert. Bei der Erstellung des Channel kann man zwischen einem normalen und einem Ende-zu-Ende verschlüsselten Channel wählen. Bei der Einrichtung wird nun der neue Bot als Mitglied hinzugefügt. Dieser Bot hat keine Berechtigung die Nachrrichten zu lesen, sondern kann lediglich neue Nachrichten zustellen.

### Grafana Konfiguration
Für die Grafana Konfiguration benötigen wir die interne Channel ID, d.h. nur der Name reicht leider nicht. Mit Hilfe des Bot Tokens und cURL geht das sehr einfach. Alternativ kann man die URI auch im Browser eintippen. Wichtig ist nur, der Bot Token muss sorgsam aufbewahrt werden, da jeder der diesen Token kennt auch ensprechend in eurem Namen agieren kann. Sollte das der einzige Alarm Kanal sein ist die Auswahl "Default (send on all alerts) sinnvoll.

Beim Abfragen via API muss der Token direkt hinter dem Wort "bot" eingefügt werden. Es fehlt hier kein Slash, das muss so sein.
```shell
curl https://api.telegram.org/botTOKEN/getUpdates| json_pp 
```

```shell
Beipspiel:
curl https://api.telegram.org/bot12345678:AFZHHTRHRTHRG/getUpdates| json_pp 
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   898  100   898    0     0   6460      0 --:--:-- --:--:-- --:--:--  6507
{
   "result" : [
      {
         "message" : {
 	 ...
         },
         "update_id" : 4576????
      },
      {
         "update_id" : 4576????,
         "message" : {
            "from" : {
               "first_name" : "***",
               "id" : 11213????,
               "language_code" : "de",
               "is_bot" : false,
               "last_name" : ***"
            },
            "message_id" : 3,
            "date" : 1582647126,
            "group_chat_created" : true,
            "chat" : {
               "title" : "Grafana",
               "id" : -472*****, <-- diese ID benötigen wir, inclusive dem Minuszeichen
               "all_members_are_administrators" : true,
               "type" : "group"
            }
         }
      }
   ],
   "ok" : true
}

```

Als nächste wird der Telegram Channel im grafana hinzugefügt unter "grafana adresse/alerting/notification/new". Wichtig hierbei, der Token ist exakt so einzufügen wie beim anlegen zugrschickt wurden, d.h. Zahl:Buchstaben und die Channel ID mit führendem Minuszeichen. Die Testfunktion sollte nun eine entsprechende Nachricht in den Channel senden.

### Alarme definieren
Auf einem beliebigen Dashboard ein Graph bearbeiten und dann auf der linken Seite die Alarm Glocke auswählen. Man kann auch mehrere Konditionen für den Alarm auswählen, zb einen zu hohen oder einen zu niedrigen Wert. Wenn die Datenpunkte nicht zu 100% mit dem testfenster übereinstimmen, z.b. nur stündlich eintreffen, ist es empfehlenswert beim Fehlen von Daten einfach den letzten Wert anzunehmen.

![Grafana-Alert](/images/grafana-alert.png)

Die Alarm Schwellwerte können nur pro Graph konfiguriert werden. D.h. wenn man mehrere Daten in einem Graph darstellt, funktioniert das ganze nicht sinnvoll. für diesen Fall nutz ich ein Gruppierungs Reihe um am Ende vom Dashboard alle Alarmierungsgraphen als einzel Panel zu erstellen. Zusätzlich ist zu beachten, das man pro Graph sich entscheiden muss, ob mal einen Alarm konfigurieren will oder die Schwellwerte in der Visualiserung darstellt. Beim Alarm wird leider nur der höhere Alarm als Linie dargestellt. Insofern ist der Ansatz einen dedizierten Graph für die Alarmierung zu erstellen eine gute Option.

Im Alarmfall werden automatisch Marker gesetzt. Hier kann man auch gut sehen ob die Retry Einstellung korrekt ist und sobald die Werte wieder normal sind wird ein entsprechender grüner Marker gesetzt. Diese Marker können im Nachhinein kommentiert werden. In diesem Beispiel wird deutlich, das der Alarm für einen der Graphen ausgelöst wurde, aber man kann hier nicht verschiedene Schwellwerte bestimmen.
![Grafana-Alert](/images/grafana-alert2.png)
