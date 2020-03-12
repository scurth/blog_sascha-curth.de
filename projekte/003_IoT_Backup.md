---
title: Backup der IoT Geräte
description: Auch IoT Geräte haben eine Konfiguration und sollte Teil der eingen Datensicherung sein
introimage: "/images/projekte/data-recovery-3126989_1920.jpg"
author: Sascha Curth
type: projekte
lang: de-DE
published: 10.03.2020
modified: 12.03.2020
---
# Backup der IoT Geräte
<TOC />

## Problemstellung
Mit der steigenden Anzahl an IoT Geräten, steigt auch das Risiko das einzelne Geräte kaputt gehen und ersetzt werden müssen. Dies kann durch Fehlbedienung, fehler beim Firmware Upgrade oder simpler Bugs in den dazu gehörigen Apps passieren. Je nach Aufgabe des Gerätes ist eine schnelle Wiederherstellung wünschenswert und besonders wenn man über einen gewissen Zeitraum die Einstellungen Stück für Stück an die eigenen Bedürfnisse angepasst hat, will man nicht wieder von vorne anfangen.

Oft stellt sich die Frage, investiere ich meine Zeit lieber in ein ordentliches Konfigurationsmanagent oder in Backup? Ich persönlich versuche den goldenene Mittelweg, bei dem alle Konfigurationen als Backup gesichert werden und dort wo es sich anbietet setzt ich auf Konfigurationsmanagement.

Um sich der Thematik zu nähern, werden folgende Fragenschwerpunkte als roter Faden verwendet
- Welche Geräte habe ich überhaupt
- Wie kann ich die Konfiguration auslesen / zurückschreiben
- Wo speichere ich das Backup
- Ergibt eine Versionierung Sinn

### Manuelle Inventarisierung
In einer anderen Projektbeschreibung habe ich bereits über mein Indoor Aquaponik berichtet. Dieser Raum war mein erster Versuch vollständig auf Cloudanbindung zu verzichten und alle Komponenten auf OpenSource umzustellen. Derzeit habe ich dort folgende Geräte mit individueller Konfiguration:
- RasperryPi 3B+ (Raspbian Linux)
- 4 BlitzWolf SHP6 Steckodosen mit Powermeter (Tasmota Firmware)
- 3 AOFO PowerStrip mit 4 x 230V und 4 USB Ports (Tasmota Firmware)
- Luftentfeuchter (Zugriff nur über Hersteller App)
- Yoctopuce Hub + Sensoren
- 4 Flower Care Sensoren

### Grobplanung
Bei den Tasmota basierten Geräten erfolgt ein Auslesen der Konfiguration und eine anschliessende Speicherung. Da sich in der Sicherung meine WLAN/WIFI und MQTT Zugangsdaten befinden, sind die Backups schützenswert. Die Daten könnten vor einer Speicherung im GIT verschlüsselt werden, allerdings ist GIT nicht unbedingt für binär Daten ausgelegt. Als andere Option bietet sich Amazon S3 an, natürlich ebenfalls vorher verschlüsselt.

Der Luftentfeuchter het als einzige Konfiguration die Timer Eintstellung von 09:00 bis 19:00 und Zielfeuchtigkeit von 65%. Das kann ich gerne der ganzen Welt mitteilen und somit meine Backup Notwendigkeit in diese Dokumentation auslagern. Allerdings ist dieses Gerät tatsächlich das einzige, welches noch direkt mit dem Internet verbunden ist und somit meinem Ziel der 100% Entkopplung im Wege steht. Beim deaktivieren der Cloudanbindung funktioniert der Timer leider nicht mehr und somit werde ich das Problem wohl später nochmal gezielt angehen müssen.

Die FlowerCare Sensoren Daten werden stündlich ausgelsen und in die InfluxDB gespeichert und können daher ignoriert werden. Allerdings wird auch hier ein Alarm benötigt, sollten die Geräte keine Daten mehr liefern.

Yoctopuce Hub enthält die MQTT Zugangsdaten und Intervalle, während die einzelnen Sensoren über eine textuelle Beschreibung verfügen welche die Zuordnung im Graphana erleichtert.

Die höchste Komplextität hat der RaspberryPi, bei dem diverse OS Konfigurationen, mehrere Docker Container und geclonte git repositories zu betrachten sind und sich ständig änderende grafana dashboards und die gesammelten Metriken in der InfluxDB relevant sind.

## Tasmota basierte Geräte
Die aktuelle Konfiguration kann man via "http://IP des Gerätes/<b>dl</b>" herunterladen. Für den simplen Zweck der Datensicherung ist dieses binäre Datenformat durchaus OK. 
```shell
wget -O meinekonfig.dump http://192.168.20.76/dl
```

Unter https://github.com/tasmota/decode-config wird ein Tool bereit gestellt, welches die Konfiguration auslesen kann und im JSON Format speichert. Die bietet die Möglichkeit einzelne Konfigurationsparameter manuell anzupassen und anschliessend auf das Gerät zu übertragen.

```shell
git clone https://github.com/tasmota/decode-config
cd decode-config
./decode-config.py -d 192.168.20.76 --backup-file Config-@H-@f-@v --backup-type json
ls Config-*
Config-tasmota-7658-Tasmota-8.1.0.2.json
```

Eine kleine Schleife und schon sind alle Konfigurationen gesichtert.
```shell
for ip in `arp -a|grep tasmota| awk '{print $2}' | tr -d '(' |tr -d ')'`; do ./decode-config.py -d ${ip} --backup-file Config-@H-@f-@v --backup-type json; done
ls Config-tasmota-*
Config-tasmota-0516-Tasmota-8.1.0.2.json  Config-tasmota-BAF2DB-4827-BlitzWolf-SHP6-15A-7.1.1.json  Config-tasmota-BAFFD4-8148-BlitzWolf-SHP6-15A-7.1.1.json
Config-tasmota-2356-Tasmota-8.1.0.2.json  Config-tasmota-BAF821-6177-BlitzWolf-SHP6-15A-7.1.1.json
Config-tasmota-7658-Tasmota-8.1.0.2.json  Config-tasmota-BAFBCD-7117-BlitzWolf-SHP6-15A-7.1.1.json
```
Alternativ zum arp könnte man auch /var/lib/misc/dnsmasq.leases nach aktuellen DHCP leases durchsuchen oder eine statische Liste mit IP Adressen verwenden.
>**TIPP**
> Jede Tasmota Steckdose hat eine 4-stellige ID, welche ich mittels permanent Marker auf das Gerät schreibe, um diese einfacher identifizieren zu können. Bsp. Config-tasmota-0516-Tasmota-8.1.0.2.json -> 0516

### Backup Verschlüsselung und Entschlüsseln
Insbersondere wenn man das Backup ausserhalb der eigenen 4 Wände lagert, sollte es immer vorher verschlüsselt werden. Lösungsmöglichkeiten gibt es viele, die einfachste und trotzdem sichere Variante ist die Verwendung von **openssl**.

<cite>
Only wimps use tape backup: real men just upload their important stuff on ftp, and let the rest of the world mirror it ;)
Torvalds, Linus (1996-07-20).
</cite>

```shell
# Verschlüsseln
openssl enc -aes-256-cbc -pbkdf2 -salt -k TollEsPAsswort -in Config-tasmota-0516-Tasmota-8.1.0.2.json -out Config-tasmota-0516-Tasmota-8.1.0.2.json.enc

# Entschlüsseln
openssl aes-256-cbc -d -pbkdf2 -salt -k TollEsPAsswort -in Config-tasmota-0516-Tasmota-8.1.0.2.json.enc -out Restore.json
```

### Speicherung im AWS S3
Mit dem folgendem Script und einem cronjob können regelmäßig, automatisch Datensicherungen erstellt werden.

```shell
#!/bin/bash
##########
# Config #
##########
MYPASSS="TollEsPAsswort"
S3BUCKET="S3BucketName"
DECODECONFIG="/home/pi/sandbox/decode-config/decode-config.py"
AWSCLIPROFILE="s3backups"

#############
# Variables #
#############
today=$(date +%F)

#################
# Fetch Configs #
#################
mkdir -p tasmota/${today}

for ip in $(arp -a|grep tasmota| awk '{print $2}' | tr -d '(' |tr -d ')')
do
  python3 ${DECODECONFIG} -d ${ip} --backup-file tasmota/${today}/Config-@H-@f-@v --backup-type json
done

###################
# Encrypt Configs #
###################
#
# Decrypt: openssl aes-256-cbc -d -pbkdf2 -salt -k ${MYPASSS} -in encryptedfile -out Restore.json
#
for file in $(find tasmota/${today} -type f -name "Config-*.json")
do
  openssl enc -aes-256-cbc -pbkdf2 -salt -k ${MYPASSS} -in ${file}  -out ${file}.enc
  rm ${file}
done

#############
# S3 Upload #
#############
aws s3 --profile ${AWSCLIPROFILE} sync tasmota s3://${S3BUCKET}/tasmota
```

Die AWS IAM Policy kann beispielsweise so aussehen.
```shell
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1582386410000",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket",
        "s3:ListObjects",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::S3BucketName",
        "arn:aws:s3:::S3BucketName/*"
      ]
    }
  ]
}
```

## InfluxDB Daten
```shell
#!/bin/bash
##########
# Config #
##########
MYPASSS="TollEsPAsswort"
AWSCLIPROFILE="s3backups"
S3BUCKET="S3BucketName"

#############
# Variables #
#############
today=$(date +%F)

##########
# Backup #
##########
mkdir -p influxdb/${today}
influxd backup -portable influxdb/${today}

tar -cpf influxdb/${today}.tar influxdb/${today}
openssl enc -aes-256-cbc -pbkdf2 -salt -k ${MYPASSS} -in influxdb/${today}.tar  -out influxdb/${today}.tar.enc
#
# Decrypt: openssl aes-256-cbc -d -pbkdf2 -salt -k ${MYPASSS} -in encryptedfile -out Restore.json
#
rm -rf influxdb/${today}
rm influxdb/${today}.tar

#############
# S3 Upload #
#############
aws s3 --profile ${AWSCLIPROFILE} sync influxdb s3://${S3BUCKET}/influxdb
```

## Grafana Dashboards und Konfiguration

## Raspbian Konfiguration

## Zusammenfassung
