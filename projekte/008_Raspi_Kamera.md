---
title: RasperryPi Kamera Überwachung mit Telegram Alarmierung
description: Raspberry Pi Kamera als Heimüberwachung und Benachrichtigung via Telegram
introimage: "/images/projekte/heimkamera.jpg"
type: projekte
lang: de-DE
published: 15.11.2020
sitemap:
  exclude: false
  changefreq: monthly
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

### Telegram Bot Rückkanal / 2 Wege Kommunikation

Was ist wenn ich via Telegram App gerne einen aktuellen Schnappschuß anfordern möchte? Dazu muss das python Skript etwas angepasst werden.

```python
...
from telepot.loop import MessageLoop
import requests
...
def handle(msg):
    content_type, chat_type, chat_id = telepot.glance(msg)
    print(content_type, chat_type, chat_id)

    if content_type == 'text':
        if msg['text'] == '/cam_snap':
            r =requests.get('http://127.0.0.1:8080/0/action/snapshot')
        elif msg['text'] == '/cam_pause':
            r =requests.get('http://127.0.0.1:8080/0/detection/pause')
        elif msg['text'] == '/cam_start':
            r =requests.get('http://127.0.0.1:8080/0/detection/start')

def main(argv=None):
    global bot_token
    global bot_chatID
    global bot

    bot_token = "12345678:ABCDEFGHT...."
    bot_chatID = "987654321"
    bot = telepot.Bot(bot_token)

    MessageLoop(bot, handle).run_as_thread()
...
```

Mit der Programmlogik kann man nun z.b. "/cam_snap" in den Chat schreiben, was dazu führt das die besagte URL vom python Prozess aufgerufen wird und motion einen Schnappschuss erzeugt. Wie bisher wird diese Aktion dann mittels mosquitto_pub an den MQTT gemeldet und das Bild entsprechend gesendet.

### Kamera Status abfragen

Die Bewegungserkennung zu pausieren macht durchaus manchmal Sinn, aber man muss auch den Status abfragen können. Dazu wird einfach der Befehlssatz erweitert.

```python
...
        elif msg['text'] == '/cam_status':
            r =requests.get('http://127.0.0.1:8080/0/detection/status')
            bot.sendMessage(chat_id, r.text)
...
```

Die Ausgabe erfolgt standardmäßig mit HTML tags und sieht wiefolgt aus

```html
<!DOCTYPE html>
<html>
<head><title>Motion 4.1.1</title></head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
<body>
<a href=/0/detection>&lt;&ndash; back</a><br><br><b>Camera 0</b> Detection status ACTIVE
</body>
</html>
```

Um das ganze für den Anwendungsfall besser leserlich zu gestalten, kann man die Ausgabe auf das raw Format umstellen.

/etc/motion/motion.conf
```shell
...
webcontrol_html_output off
...
```

```shell
Camera 0 Detection status ACTIVE
```

### Telgram CustomKeyboard

Statt die Kommandos einzutippen, wie zb. /cam_snap, wäre es doch noch besser wenn es einen Button gäbe mit dieser Funktion.

Dazu verändern wir die on_chat_message so, dass sobald irgendwas angefragt wird eine Antwort geschickt wird die nur die unterstützten Funktionen enthält. Wenn man auf einen solchen Button klickt, wird eine "callback_query" geschickt.

```python
def on_chat_message(msg):
    content_type, chat_type, chat_id = telepot.glance(msg)
    print(content_type, chat_type, chat_id)

    helptext = "Verfügbare Kommandos"
    
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
                   [ InlineKeyboardButton(text='📸 Cam snapshot', callback_data='cam_snap'),
                     InlineKeyboardButton(text='❓ Cam status', callback_data='cam_status')
                   ],
                   [ InlineKeyboardButton(text='📼 Cam an', callback_data='cam_start'),
                     InlineKeyboardButton(text='📴 Cam aus', callback_data='cam_pause')
                   ],
               ])

    bot.sendMessage(chat_id, helptext, reply_markup=keyboard)
```

Die main() Funktion muss daher nun zwischen normalem Chat und der Callback_query unterscheiden.

```python
...
 MessageLoop(bot, {'chat': on_chat_message,
                   'callback_query': on_callback_query}).run_as_thread()
...
```

Das Mapping könnte dann so aussehen:

```python
def on_callback_query(msg):
    global global_temperature
    global global_wass_temperature

    antwort='Irgendwas ist schief gelaufen.'
    query_id, from_id, query_data = telepot.glance(msg, flavor='callback_query')
    print('Callback Query:', query_id, from_id, query_data)

    if query_data == 'cam_snap':
        r =requests.get('http://127.0.0.1:8080/0/action/snapshot')
        antwort=r.text
    elif query_data == 'cam_pause':
        r =requests.get('http://127.0.0.1:8080/0/detection/pause')
        antwort=r.text
    elif query_data == 'cam_start':
        r =requests.get('http://127.0.0.1:8080/0/detection/start')
        antwort=r.text
    elif query_data == 'cam_status':
        r =requests.get('http://127.0.0.1:8080/0/detection/status')
        antwort=r.text

    bot.answerCallbackQuery(query_id, text=antwort, show_alert=0)
```


## Das Ergebnis

Nachdem die Kamera ordentlich ausgerichtet war und die Schwellwerte eingestellt waren, bekomme ich nun eine Momentaufnahme als Nachricht via Telegram. In dieser Telegram Gruppe sind dann auch die weiteren Familienmitglieder und alle entsprechend informiert. Alles in Allem, kein riesen Aufwand und ein Ergebnis das sich im wahrsten Sinne des Wortes sehen lassen kann. Insbesondere die Telegram Integration und die vereinfachte Benutzung mittels der Buttons bereitet Freude ohne die Sicherheit zu gefährden.

## Wie gehts weiter

Da ich die "on_motion_detected" Ereignisse ebenfalls an den MQTT Bus schicken, könnte ich mit Grafana eine Art Aktivitäten Protokoll erstellen und so zeitlich mit anderen Metriken korrelieren. Das Event sieht so in etwa aus:

```shell
fishberry/cam/0/motion_detected {"pixel": 15267,"noise": 13, "motionwidth": 60, "motionheight": 404, "xcoord": 124, "ycoord": 538 }
```

Natürlich müssen API Token und ChatID aus dem Programm Code entfernt und noch sicher ein paar andere Verschönerungen durchgeführt werden.

Ich werde das Script entsprechend erweitern, wie immer unter [https://www.github.com/scurth](https://www.github.com/scurth) als open-source veröffentlichen.

