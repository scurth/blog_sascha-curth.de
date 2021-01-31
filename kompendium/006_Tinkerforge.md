---
title: Tinkerforge Sensoren und Aktoren
description: Daten abgreifen und Aktoren steuern
introimage: "/images/tinkerforge.jpg"
type: article
lang: de-DE
published: 18.08.2020
sitemap:
  exclude: false
  changefreq: monthly
---
# Tinkerforge Sensoren
<TOC />

# In einem Satz
Tinkerforge bietet Sensoren und Aktoren für nahezu jeden Anwendungfall, welche sich leicht in ein Linux basiertes Open-Source Ecosystem integrieren lassen.

## Überblick
Tinkerforge benötigt eine "Master" Brick, welcher via USB mit einem Linux Rechner verbunden wird. An diesen Master Brick werden die Bricklets angeschlossen werden. Um die Daten auszulesen, muss der "brickd" daemon verwendet werden. Diese bietet ein API und kann auch mittels brickviewer betrachtet werden.

## Daten via MQTT zur Verfügung stellen
Um die Daten vom brickd abzgreifen und via MQTT bereit zu stellen, gibt es eine kostenlose open-source Lösung, welche direkt von Tinkerforge bereit gestellt wird. [MQTT - API Bindings](https://www.tinkerforge.com/de/doc/Software/API_Bindings_MQTT.html)

Nach der Installation muss eine JSON Konfiguration bereit gestellt werden, um festzulegen welche Daten relevant sind.
```shell
/usr/bin/tinkerforge_mqtt --show-payload --init-file /etc/tinkerforge_mqtt/init.json
```

### 4-20mA Industrie-Standard
Es gibt einen Industrie Standard, bei dem ein Sensor unter Spannung gesetzt wird und abhängig von dem Sensorzustand wird ein Strom im Bereich vom 4 bis 20 mA geliefert, welcher dann ausgewertet werden kann.

[Tinkerforge Industrial Dual 0-20mA Bricklet 2.0](https://www.tinkerforge.com/de/doc/Hardware/Bricklets/Industrial_Dual_020mA_V2.html)

> Mit dem Industrial Dual 0-20mA Bricklet 2.0 können Bricks Ströme von 0 bis 22,5mA gemessen werden.
> Das Bricklet kann genutzt werden um bis zu zwei IEC 60381-1 Typ 2 und Typ 3 Sensoren auszulesen.

#### Wasserfüllstand
Komponenten:
- [Tinkerforge Isolator Bricklet](https://www.tinkerforge.com/en/doc/Hardware/Bricklets/Isolator.html)
- [Tinkerforge Industrial Dual 0-20mA Bricklet 2.0](https://www.tinkerforge.com/de/doc/Hardware/Bricklets/Industrial_Dual_020mA.html)
- [DC24V 4-20mA Edelstahl Füllstandssensor Wasserstandssensor](https://amzn.to/3ay3zYd)
- 24V Gleichstrom Netzteil

Das ganze ist wiefolgt aufgebaut

RaspberryPi mit Tinkerforge HAT -> Isolator Bricklet -> Industrial Dual Bricklet -> 2 Wasserstandssensoren

24V Netzteil -> Industrial Dual Bricklet

Produktbild:
![Edelstahl_Füllstandssensor_Wasserstandssensor](/images/DC24V_4-20mA_Edelstahl_Füllstandssensor_Wasserstandssensor.jpg)


Tinkerforge MQTT Init Datei, enthält zum einen die Konfiguration der einzelnen Sensoren, als auch den notwendigen '"register" : true', um die Daten zu erhalten. Die gesamte Dokumentation für diese Module findet man [hier](https://www.tinkerforge.com/de/doc/Software/Bricklets/IndustrialDual020mAV2_Bricklet_MQTT.html#industrial-dual-0-20ma-v2-bricklet-mqtt-api)

```json
{
   "tinkerforge/request/industrial_dual_0_20ma_v2_bricklet/XXX/set_sample_rate" : {
      "rate" : 1
   },
   "tinkerforge/request/industrial_dual_0_20ma_v2_bricklet/XXX/set_gain" : {
      "gain" : 0
   },
   "tinkerforge/request/industrial_dual_0_20ma_v2_bricklet/XXX/get_current": {"channel": 1},
   "tinkerforge/request/industrial_dual_0_20ma_v2_bricklet/XXX/set_current_callback_configuration" : {
      "channel": 1,
      "period": 60000,
      "value_has_to_change": false,
      "option": "off",
      "min": 0,
      "max": 0
   },
   "tinkerforge/request/industrial_dual_0_20ma_v2_bricklet/XXX/get_current": {"channel": 0},
   "tinkerforge/request/industrial_dual_0_20ma_v2_bricklet/XXX/set_current_callback_configuration" : {
      "channel": 0,
      "min": 0,
      "max": 0,
      "value_has_to_change" : false,
      "period" : 60000,
      "option" : "off"
   },
   "tinkerforge/register/industrial_dual_0_20ma_v2_bricklet/XXX/current" : {
      "register" : true
   }
}
```

Wenn es funktioniert, kann man die Messwerte im MQTT Bus finden und von dort aus z.b. in [Grafana](https://www.sascha-curth.de/kompendium/099_Grafana.html) darstellen.
```shell
mosquitto_sub -t 'tinkerforge/#' -v
tinkerforge/callback/industrial_dual_0_20ma_v2_bricklet/XXX/current {"current": 5070054, "channel": 1}
tinkerforge/callback/industrial_dual_0_20ma_v2_bricklet/XXX/current {"current": 5338598, "channel": 0}
```

## Daten in die InfluxDB schreiben
siehe: [Telegraf interner Link](/kompendium/099_Grafana.html#telegraf-als-service-anlegen)
