---
title: Netatmo Presence Lokaler Zugriff
description: Netatmo Presence Lokaler Zugriff
introimage: "/images/netatmo_presence.jpg"
author: Sascha Curth
type: article
lang: de-DE
published: 07.05.2020
modified: 07.05.2020
---
# Netatmo Presence
Diese WLAN Outdoor Kamera kann zwischen Menschen, Tieren und Autos unterscheiden und entsprechend alarmieren und/oder aufzeichnen. Die Aufzeichnung wird immer auf der lokalen SD-Karte gespeichert und kann zusätzlich auf einem FTP oder in Dropbox gespeichert werden. Für den Zugriff auf den Video Stream via App wird von Netatmo ein VPN Tunnel initiert, was sicherlich komfortabel ist, allerdings auch bedeutet das der Netzwerkzugriff der Kamera limitiert werden sollte.

## Welche Geräte werden unterstützt

[Netatmo Presence](https://www.netatmo.com/de-de/security/cam-outdoor) 
- [API Documentation](https://dev.netatmo.com/apidocumentation/security)


## Lokaler Zugriff
Es werden 2 Informationen benötigt:
- IP Adresse der Kamera
- Kamera spezifische SecurityID

```shell
curl http://IP_Adresse/Secure_ID/command/ping

{"local_url":"http://IP_Adresse/Secure_ID","product_name":"Welcome Netatmo"}
```

## Flutlicht Modus einstellen

```shell
curl "http://IP_Adresse/Secure_ID/command/floodlight_set_config?config=%7B%22mode%22:%22on%22%7D"
{"status":"ok"}
curl "http://IP_Adresse/Secure_ID/command/floodlight_set_config?config=%7B%22mode%22:%22off%22%7D"
{"status":"ok"}
curl "http://IP_Adresse/Secure_ID/command/floodlight_set_config?config=%7B%22mode%22:%22auto%22%7D"
{"status":"ok"}
```

## Kamera ein- bzw. ausschalten

```shell
curl "http://IP_Adresse/Secure_ID/command/changestatus?status=on"
{"error":{"code":7,"message":"Already on"}}
curl "http://IP_Adresse/Secure_ID/command/changestatus?status=off"
{"status":"ok"}
curl "http://IP_Adresse/Secure_ID/command/changestatus?status=on"
{"status":"ok"}
```

## Lokaler Zugriff auf das aktuelle Bild / Live Stream

**Video Stream**

http://IP_Adresse/Secure_ID/live/files/high/index.m3u8

**Bild Snapshot**

http://IP_Adresse/Secure_ID/live/snapshot_720.jpg

## Netzwerksicherheit
Die Kamera Streams sind leider nur unverschlüsselt verfügbar und zusätzlich sollte die Secure-ID geheim gehalten werden. Im folgenden Beispiel wird eine statische html Seite erstellt, die keine schützenswerten Informationen enthält. Die Referenzierten Resources werden mittels Nginx Reverse Proxy an die Kamera weitergeleitet. 

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

Die dazu passende nginx Konfiguration
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

Wird dieses Ngnix Setup z.b. auf einem Raspberry PI betrieben, welcher gleichzeitig als WLAN Accesspoint für die Kameras dient, ist zwar die Kommunikation vom Raspi zur Kamera unverschlüsselt (http), allerdings kann sichergestellt werden das WPA2 verwendet wird und gglfs über VLAN eine WIFI Client zu Client Kommunikation unterbunden werden.

## Calling Home
Die Kameras sind über die Hersteller App bedienbar und da man insbesondere auf die Streams auch von ausserhalb zugreifen möchte, kann das auch so bleiben. Technisch ist das so gelöst, das die Kamera einen VPN Tunnel zu Netatmo aufbaut. Dies bietet zumindest die theoretische Möglichkeit, das Netatmo auf das gesamte Hausnetzwerk zugreift. IP tables Regeln sichern dabei das Netzwerk und erlauben der Kamera lediglich die Kommunikation mit den netatmo VPN Servern und dem NTP Server, aber nicht mit dem internen Netzwerk oder anderen externen Adressen.

**tcpdump -i wlan0 host 192.168.10.106 -s 0**
```shell
21:27:39.599926 IP 192.168.10.106.47965 > mail2.light-speed.de.ntp: NTPv4, Client, length 48
21:27:57.527701 IP 192.168.10.106.55049 > 195-154-104-67.rev.poneytelecom.eu.ipsec-nat-t: isakmp-nat-keep-alive
21:28:04.936185 IP 192.168.10.106.55049 > 195-154-104-67.rev.poneytelecom.eu.ipsec-nat-t: UDP-encap: ESP(spi=0xc46cf315,seq=0x1a9), length 132
21:28:04.974195 IP 195-154-104-67.rev.poneytelecom.eu.ipsec-nat-t > 192.168.10.106.55049: UDP-encap: ESP(spi=0xc93735a1,seq=0x162), length 132
```

Die Kommunikation mit einem externen NTP ist nicht zwingend notwendig und ein interner NTP ist schnell konfiguriert.
```shell
apt-get install ntp ntpdate
``` 

Es gibt leider keine direkte NTP Einstellung in der Kamera, aber via DHCP kann die option-42 gesetzt werden, bsp:

**/etc/dnsmasq.conf**
```config
...
dhcp-option=42,192.168.0.251
...
```

