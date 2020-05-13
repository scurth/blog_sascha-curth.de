---
title: Netatmo Presence
description: Netatmo Presence
introimage: "/images/netatmo_presence.jpg"
author: Sascha Curth
type: article
lang: de-DE
published: 07.05.2020
modified: 07.05.2020
---
# Netatmo Presence
<TOC />

# In einem Satz
Die Netatmo WLAN Outdoor Kamera kann auch unabhängig von der Netatmo Cloud und dazu gehörigen App verwendet werden, ohne dabei Veränderungen an der Kamera vornehmen zu müssen.

## Welche Funktionen bietet die Kamera
Neben einer Bewegungsmelderfunktion zum automatischen Einschalten des Flutlichts, kann die Kamera zwischen Menschen, Tieren und Autos unterscheiden und entsprechend alarmieren und/oder aufzeichnen. Diese Aufzeichnung wird immer auf der lokalen SD-Karte gespeichert und kann zusätzlich auf einen FTP Server exportiert werden oder zu Dropbox. Sowohl das aktuelle Standbild als auch der Live Stream in unterschiedlichen Qualitätsstufen können über das lokale Netz abgerufen werden.

Der Zugriff via App erfolgt über einen VPN Tunnel zwischen Kamera und den Netatmo Servern. Dies ist komfortable bringt aber auch ein Sicherheitsrisiko mit, da der VPN Tunnel bi-direktional ist und somit zumindest theoretisch den Zugriff auf das gesamte lokale Netzwerk ermöglicht.

## Welche Geräte werden unterstützt

[Netatmo Presence](https://www.netatmo.com/de-de/security/cam-outdoor) 
- [API Documentation](https://dev.netatmo.com/apidocumentation/security)

## Wie erfolgt der lokale Zugriff
Es werden 2 Informationen benötigt:
- IP Adresse der Kamera
- Kamera spezifische SecurityID

Die Daten können mit einer Testanfrage überprüft werden:

**curl http://IP_Adresse/Secure_ID/command/ping**
```shell
{"local_url":"http://IP_Adresse/Secure_ID","product_name":"Welcome Netatmo"}
```

## Flutlicht Modus einstellen

```shell
ON
curl "http://IP_Adresse/Secure_ID/command/floodlight_set_config?config=%7B%22mode%22:%22on%22%7D"
{"status":"ok"}

OFF
curl "http://IP_Adresse/Secure_ID/command/floodlight_set_config?config=%7B%22mode%22:%22off%22%7D"
{"status":"ok"}

AUTO
curl "http://IP_Adresse/Secure_ID/command/floodlight_set_config?config=%7B%22mode%22:%22auto%22%7D"
{"status":"ok"}
```

## Kamera ein- bzw. ausschalten

```shell
OFF
curl "http://IP_Adresse/Secure_ID/command/changestatus?status=off"
{"status":"ok"}

ON
curl "http://IP_Adresse/Secure_ID/command/changestatus?status=on"
{"status":"ok"}
```

## Lokaler Zugriff auf das aktuelle Bild / Live Stream

**Video Stream**

http://IP_Adresse/Secure_ID/live/files/high/index.m3u8

**Bild Snapshot**

http://IP_Adresse/Secure_ID/live/snapshot_720.jpg

## Verschlüsselte Übertragung
Die Kamera Streams sind leider nur unverschlüsselt verfügbar und zusätzlich sollte die Secure-ID geheim gehalten werden. Im folgenden Beispiel wird eine statische html Seite erstellt, die keine schützenswerten Informationen enthält. Die referenzierten Resourcen werden dann mittels Nginx Reverse Proxy an die Kamera weitergeleitet. Dies bietet zustäzlich die Möglichkeit den Zugriff über den Nginx auch zusätzlich mit einer Authentifizierung abzusichern.

Wird dieses Ngnix Setup z.b. auf einem Raspberry PI betrieben, welcher gleichzeitig als WLAN Accesspoint für die Kameras dient, ist zwar die Kommunikation vom Raspi zur Kamera unverschlüsselt (http), allerdings kann sichergestellt werden das WPA2 verwendet wird und gglfs über VLAN eine WIFI Client zu Client Kommunikation unterbunden werden.

```html
<html>
<head>
<style>
.box {
     float: left;
     width: 100%;
     margin-right: 3.33333%;
     padding: 20px;
     background: #eee;
     box-sizing: border-box;
}
</style>
</head>
<body>

    <link href="https://unpkg.com/video.js@6.7.1/dist/video-js.css" rel="stylesheet">
    <script src="https://unpkg.com/video.js@6.7.1/dist/video.js"></script>
    <script src="https://unpkg.com/@videojs/http-streaming@0.9.0/dist/videojs-http-streaming.js"></script>
<div class="box">
    <video-js id="camera_nord" class="vjs-default-skin vjs-16-9" controls muted autoplay preload="auto">
        <source src="https://INTERNER-SERVER/cam-nord/m3u8" type="application/x-mpegURL">
    </video-js>
</div>

<head>
</body>

<script>
  var player = videojs('camera_nord', {
    html5: {
      hls: {
        overrideNative: true
      }
    }
  });
</script>
</html>
```

Die dazu passende Nginx Konfiguration
```config
...
       location /cam-nord/m3u8 {
            proxy_pass http://IP_Adresse/Secure_ID/live/index.m3u8;
       }
       location /cam-nord/files/ {
            proxy_pass http://IP_Adresse/Secure_ID/live/files/;
       }
...
```

## Calling Home
Die Kamera ist über die Hersteller App bedienbar und da man insbesondere auf die Streams auch von ausserhalb zugreifen möchte, kann das auch so bleiben. Technisch ist das so gelöst, dass die Kamera einen VPN Tunnel zu Netatmo aufbaut. Da dies, wie bereits erwähnt, zumindest die theoretische Möglichkeit bietet, dass Netatmo auf das gesamte Hausnetzwerk zugreift, ist eine Firewall Absicherung vorzunehmen und sämtlicher "nicht-VPN" Verkehr(versuch) zu protokollieren.

**tcpdump -i wlan0 host IP_Adresse -s 0**
```shell
21:27:39.599926 IP 192.168.10.106.47965 > mail2.light-speed.de.ntp: NTPv4, Client, length 48
21:27:57.527701 IP 192.168.10.106.55049 > 195-154-104-67.rev.poneytelecom.eu.ipsec-nat-t: isakmp-nat-keep-alive
21:28:04.936185 IP 192.168.10.106.55049 > 195-154-104-67.rev.poneytelecom.eu.ipsec-nat-t: UDP-encap: ESP(spi=0xc46cf315,seq=0x1a9), length 132
21:28:04.974195 IP 195-154-104-67.rev.poneytelecom.eu.ipsec-nat-t > 192.168.10.106.55049: UDP-encap: ESP(spi=0xc93735a1,seq=0x162), length 132
```

In dem Beispiel erfolgt zusätzlich eine Kommunikation mit einem externen NTP. NTP als Service ist notwendig, aber ein interner NTP ist schnell konfiguriert und so kann die externe Kommunikation auf eine Minimum reduziert werden.

Es gibt leider keine direkte NTP Einstellung in der Kamera, aber via DHCP kann die option-42 gesetzt werden, bsp:

**/etc/dnsmasq.conf**
```
...
dhcp-option=42,192.168.0.251
...
```

```bash
apt-get install ntp ntpdate
``` 

