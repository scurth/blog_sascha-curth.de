---
title: RasperryPi Kamera Überwachung mit Telegram Alarmierung
description: Raspberry Pi Kamera als Heimüberwachung und Benachrichtigung via Telegram
introimage: "/images/projekte/heimkamera.jpg"
type: projekte
lang: de-DE
published: 15.11.2020
---
# {{ $frontmatter.title }}
![L1](/images/projekte/heimkamera.jpg)
<TOC />


## Problemstellung

Wenn es um das Thema Überwachungskamera geht ist die Frage des Vertrauens besonders wichtig. Nicht nur soll es zuverlässig funktionieren, sondern auch soll es niemanden möglich sein auf die Daten zuzugreifen. Diametral zum Lockdown möchte man als Besitzer jederzeit und von überall mal nachgucken können und im Falle einer Erkennung zeitnah alarmiert werden. In diesem Projekt wird ein Raspberry Pi mit Kamera ausgestattet, die open-source Software "motion" zur Bewegungserkennung verwendet und an eine Telegram Gruppe ein Alarm geschickt, welcher gleich ein Schanppschuß von der Situation enthält.

## Hardware

- Raspberry Pi 4
- Raspberry Pi Nachtsicht Kamera, Fisheye

## These

Die verwendetet Software "motion" kann im Falle eines Ereignisses automatisch eine Aufnahme starten. Zusätzlich gibt es die Möglichkeit einen Datenbankeintrag zu erstellen und dann entsprechend über ein cronjob auf diese Ereignisse zu reagieren. Das ist mir jedoch zu sehr 1980er und daher verwende ich die eingebaute Methode um je nach Ereignis, z.b. on_picture_save, on_movie_start, etc, ein Programm mit diversen Parametern zu starten, welches die Informationen als JSON String an meinen MQTT-Bus sendet. Von dort aus kann ich auf die Ergeignisse auf verschiedenste Arten reagieren.

## Experiment

### Motion - automatische Aufnahme

```shell
apt-get install motion
```

Die Konfiguration wird entsprechend angepasst und erstmal getestet, das eine Aufnahme erfolgt und die Video Einstellungen so sinnvoll sind.

/etc/motion/motion.conf

```bash
daemon on
process_id_file /var/run/motion/motion.pid
setup_mode off
logfile /var/log/motion/motion.log
log_level 6
log_type all
videodevice /dev/video0
v4l2_palette 17
input -1
norm 0
frequency 0
power_line_frequency -1
rotate 180
flip_axis none
width 1024
height 768
framerate 25
minimum_frame_time 0
netcam_keepalive off
netcam_tolerant_check off
rtsp_uses_tcp on
auto_brightness on
brightness 0
contrast 0
saturation 0
hue 0
roundrobin_frames 1
roundrobin_skip 1
switchfilter off
threshold 1500
threshold_tune on
noise_level 32
noise_tune on
despeckle_filter EedDl
smart_mask_speed 0
lightswitch 50
minimum_motion_frames 1
pre_capture 0
post_capture 0
event_gap 60
max_movie_time 0
emulate_motion off
output_pictures center
output_debug_pictures off
quality 75
picture_type jpeg
ffmpeg_output_movies on
ffmpeg_output_debug_movies off
ffmpeg_bps 400000
ffmpeg_variable_bitrate 0
ffmpeg_video_codec mp4
ffmpeg_duplicate_frames true
timelapse_interval 0
timelapse_mode daily
timelapse_fps 30
timelapse_codec mpeg4
use_extpipe off
snapshot_interval 0
locate_motion_mode on
locate_motion_style box
text_right %Y-%m-%d\n%T-%q
text_left CAMERA %t
text_changes on
text_event %Y%m%d%H%M%S
text_double on
target_dir /home/pi/cam
snapshot_filename %v-%Y%m%d%H%M%S-snapshot
picture_filename %v-%Y%m%d%H%M%S-%q
movie_filename %v-%Y%m%d%H%M%S
timelapse_filename %Y%m%d-timelapse
ipv6_enabled off
stream_port 8081
stream_quality 50
stream_motion off
stream_maxrate 1
stream_localhost off
stream_limit 0
stream_auth_method 0
webcontrol_port 8080
webcontrol_localhost on
webcontrol_html_output on
webcontrol_parms 0
track_type 0
track_auto off
track_iomojo_id 0
track_step_angle_x 10
track_step_angle_y 10
track_move_wait 10
track_speed 255
track_stepsize 40
quiet on
```

### Nachrichten an MQTT schicken

Hierzu bedienen wir uns der eingebauten script Unterstützung und mosquitto_pub für das Senden der JSON Strings. Die Konfiguration wird einfach an die /etc/motion/motion.conf angefügt und anschliessend mittels "service motion restart" aktiviert.

```bash
on_picture_save /usr/bin/mosquitto_pub -t "fishberry/cam/%t/picture_save" -m "{\"filename\": \"%f\"}"
on_motion_detected /usr/bin/mosquitto_pub -t "fishberry/cam/%t/motion_detected" -m "{\"pixel\": %D,\"noise\": %N, \"motionwidth\": %i, \"motionheight\": %J, \"xcoord\": %K, \"ycoord\": %L }"
on_movie_start /usr/bin/mosquitto_pub -t "fishberry/cam/%t/movie_start" -m "{\"filename\": \"%f\"}"
on_movie_end /usr/bin/mosquitto_pub -t "fishberry/cam/%t/movie_end" -m "{\"filename\": \"%f\"}"
on_camera_lost /usr/bin/mosquitto_pub -t "fishberry/cam/%t/camera_lost" -m "1"
on_camera_found /usr/bin/mosquitto_pub -t "fishberry/cam/%t/camera_found" -m "1"
```

An dieser Stelle sollte nun im Falle einer Bewegungserkennung auf dem MQTT Bus eine Nachricht wie diese zu sehen sein.

```shell
mosquitto_sub -v -t 'fishberry/#'
fishberry/cam/0/picture_save {"filename": "/home/pi/cam/01-20201114211113-04.jpg"}
```

### Telegram ChatBot / Gruppe erstellen

Um Nachrichten an das Telegram Netzwerk zu senden, muss man sich authentifizieren. Um das spätere Testen zu vereinfacher, empfehle ich die Telegram App zusätzlich zum Handy auch auf dem Computer zu installieren, da man so einfach Daten kopieren kann.

Jetzt mit der Telegram App (Computer oder Handy), den BotFather öffnen [https://telegram.me/BotFather](https://telegram.me/BotFather).

- /mybots: Wenn man schon Bots eingereichtet hat, kann man hiermit den API Token auslesen
- /newbot: hiermit legt man einen neuen an

Jetzt haben wir den notwendigen API Token um Nachrichten verschicken zu können. Diesen API Token muss man geheim halten, da sonst jemand Drittes unter unserem Namen Nachrichten verschicken könnte.

Als nächstes legt man eine Gruppe an und lädt den angelegten Bot zu der Gruppe ein.

Um nun eine Nachricht an diese Gruppe zu verschicken, müssen wir noch die ID dieser Gruppe herausfinden.

```shell
https://api.telegram.org/bot<YourBOTToken>/getUpdates
{"ok":true,"result":[]}
```
Da bisher noch keine Nachrichten ausgetauscht worden sind, ist die Liste für diesen Bot leer. Wenn man nun in der Telegram Gruppe eine "test" Nachricht schickt, sieht der Ergebnis so aus

```shell
curl https://api.telegram.org/bot<YourBOTToken>/getUpdates| json_pp 
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   296  100   296    0     0   2596      0 --:--:-- --:--:-- --:--:--  2573
{
   "result" : [
      {
         "message" : {
            "date" : 1605467234,
            "text" : "test",
            "from" : {
               "last_name" : "Curth",
               "language_code" : "de",
               "id" : 123455667xxx,
               "first_name" : "Sascha",
               "is_bot" : false
            },
            "chat" : {
               "last_name" : "Curth",
               "first_name" : "Sascha",
               "id" : 12354656xxx,     <----- Das ist die Chat ID
               "type" : "private"
            },
            "message_id" : 2218
         },
         "update_id" : 100033423
      }
   ],
   "ok" : true
}
```

Diese chat ID "12354656xxx" brauchen wir neben dem API Token im nächsten Schritt.

### Python Programm zur Alarmierung

Nun schreiben wir ein kleines python script, welches am MQTT auf eine "picture_save" Nachricht lauert und das Schnappschussbild an die Telegram Gruppe sendet.

```python
#!/usr/bin/python3

import paho.mqtt.client as mqtt
import sys
import json
import telepot

def on_connect(client, userdata, flags, rc):  # The callback for when the client connects to the broker
    print("Connected with result code {0}".format(str(rc)))  # Print result of connection attempt
    client.subscribe("fishberry/cam/0/picture_save")

def on_message(client, userdata, msg):  # The callback for when a PUBLISH message is received from the server.
    print("Message received-> " + msg.topic + " " + str(msg.payload))  # Print a received msg
    json_obj=json.loads(msg.payload)
    if "filename" in json_obj:
        result=json_obj["filename"]
        bot.sendPhoto(bot_chatID, photo=open(result, 'rb'), caption=result)
    else:
        print("No filename, skipping")
 
def main(argv=None):
    global bot_token
    global bot_chatID
    global bot

    bot_token = "12345678:ABCDEFGHT...."
    bot_chatID = "987654321"
    bot = telepot.Bot(bot_token)


    global client
    client = mqtt.Client("picture_save_listener")  # Create instance of client with client ID “digi_mqtt_test”
    client.on_connect = on_connect  # Define callback function for successful connection
    client.on_message = on_message  # Define callback function for receipt of a message
    client.connect('127.0.0.1', 1883)
    client.loop_forever()  # Start networking daemon

if __name__ == "__main__":
    main()

```

Um nicht immer vor der Kamera rumhampeln zu müssen, kann man von nun an mit einem beliebigen Bild testen und eine MQTT Nachricht schicken.

```shell
mosquitto_pub -t 'fishberry/cam/0/picture_save' -m '{"filename": "/home/pi/cam/01-20201114211113-04.jpg"}'
```

## Das Ergebnis

Nachdem die Kamera ordentlich ausgerichtet war und die Schwellwerte eingestellt waren, bekomme ich nun eine Momentaufnahme als Nachricht via Telegram. In dieser Telegram Gruppe sind dann auch die weiteren Familienmitglieder und alle entsprechend informiert. Alles in Allem, kein riesen Aufwand und ein Ergebnis das sich im wahrsten Sinne des Wortes sehen lassen kann.

## Wie gehts weiter

Da ich die "on_motion_detected" Ereignisse ebenfalls an den MQTT Bus schicken, könnte ich mit Grafana eine Art Aktivitäten Protokoll erstellen und so zeitlich mit anderen Metriken korrelieren. Das Event sieht so in etwa aus:

```shell
fishberry/cam/0/motion_detected {"pixel": 15267,"noise": 13, "motionwidth": 60, "motionheight": 404, "xcoord": 124, "ycoord": 538 }
```

Zusätzlich kann man den Telegram Bot auch für die zweiseitige Kommunikation nutzen und beispielsweise Kommandos wie "snapshot" schicken um ein aktuelles Bild anzufordern oder "movie" um das gerade aufgezeichnete Video zu erhalten. Natürlich müssen API Token und ChatID aus dem Programm Code entfernt und noch sicher ein paar andere Verschönderungen durchgeführt werden.

Icd werde das Script entsprechend erweitern, wie immer unter [github.com/scurth](github.com/scurth) als open-source veröffentlichen.

