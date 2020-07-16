---
title: InfluxDB
description: InfluxDB wird als Timeseries Datenbank für Sensordaten verwendet und mittels Grafana dargestellt
introimage: "/images/InfluxDB-Logo.png"
author: Sascha Curth
type: article
lang: de-DE
published: 16.07.2020
---
# Inhalt
<TOC />
# In einem Satz
Die InfluxDB ist eine ideale Datenbank um Sensordaten zu speichern und auszuwerten.

## Überblick

### InfluxDB

## Quick & Dirty
```shell
sudo apt-get install influxdb
sudo /bin/systemctl enable influxdb
sudo service influxdb restart
```
Danach läuft der InfluxDB Server auf dem Port 8086.

## InfluxDB Installation mittels Docker

## Datensicherung
```
service influxdb stop
cd /var/lib/influxdb
rsync -av ../influxdb/ /var/tmp/influxbck
service influxdb start
```

## Versions Upgrade

## Wartung und Tuning

### Index Daten im TSI Format speichern

Beim speichern der Daten werden zusätzlich noch index Informationen erzeugt, um die Daten später schneller durchsuchen und aufrufen zu können. In der Standardkonfiguration werden diese Index-Daten im Arbeitsspeicher gehalten, was insbesondere bei der Verwendung von kleinen Serversystemen oder Raspberry Pi schnell zu Problemen führen kann. Als Alternative kann man auf den sogenannten Time Series Index (TSI) umstellen. Das Betriebssystem wird dann weiterhin versuchen Teile des Index im Speicher zu halten, was üblicherweise dazu führt, dass alte Daten durch die aktuellen Daten fortlaufend ersetzt werden.

/etc/influxdb/influxdb.conf
```ini
[data]
...
  # index-version = "inmem"
  index-version = "tsi1"
```

Um die Konfigurationsänderung zu aktivieren muss die InfluxDB gestoppt und neu gestartet werden. Alte inmem Indizies werden nicht automatisch aktualisiert, sondern nur neue Daten entsprechend gespeichert. Während das Schreiben und Lesen problemlos funktioniert, können Datenlöschungen mit gemischten Indexarten nicht durchgeführt werden und man erhält folgende Fehlermeldung:

```
"ERR: cannot delete data. DB contains shards using both inmem and tsi1 indexes. Please convert all shards to use the same index type to delete data."
```

Die Konvertierung erfolgt so:

```shell
service influxdb stop
cd /var/lib/influxdb
# Backup der Daten
rsync -av ../influxdb/ /var/tmp/influxbck
su - influxdb -s /bin/bash
influx_inspect buildtsi -datadir data/ -waldir wal/
exit
service influxdb start
```

### InfluxDB Series Compact
Es kann vorkommen, das dieser Vorgang auf Grund von Speicherknappheit nicht durchgeführt werden kann und dann folgende Fehlermeldung ausgegeben wird:

```
lvl=info msg="Error replacing new TSM files" log_id=0O26spiW000 engine=tsm1 tsm1_level=2 tsm1_strategy=level trace_id=0O26y6~G000 op_name=tsm1_compact_group error="cannot allocate memory"
```

Als erstes sollte die influxdb recht konservativ konfiguriert werden.

/etc/influxdb/influxdb.conf
```ini
[data]
...
  max-concurrent-compactions = 1
  compact-throughput-burst = "5m"
```

Danach wird der compact Vorgang offline durchgeführt und die InfluxDB mit den neuen Einstellungen betrieben.
```shell
service influxdb stop
su - influxdb -s /bin/bash
cd /var/lib/influxdb
influx_inspect buildtsi -compact-series-file -datadir ./data -waldir ./wal
exit
service influxdb start
```

