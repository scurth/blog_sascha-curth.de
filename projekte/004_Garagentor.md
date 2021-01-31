---
title: Das Garagentor via WLAN/WiFi steuern
description: Garagentormotoren können einfach mit einem IoT Relais angesteuert werden
introimage: "/images/projekte/garagedoor.jpg"
type: projekte
lang: de-DE
published: 24.03.2020
sitemap:
  exclude: false
  changefreq: monthly
---
# Das Garagentor via WLAN/WiFi steuern
<TOC />

## Problemstellung
Seit einigen Jahren haben wir ein elektrisches Gargentor, welches sich entweder mittels Funkfernbedienung oder Drucktaster öffnen bzw. schliessen lässt. Mit zunehmendem Alter der Kinder, ist es nicht mehr praktikabel die Fernbedienung mitzugeben, wenn diese mit dem Fahrrad unterwegs sind. Da heutzutage das Handy eigentlich immer mit dabei ist, ist die Idee entstanden das Tor um einen WLAN-Schalter zu erweitern. Hierbei steht Sicherheit im Vordergrund, da man so buchstäblich Haus und Hof öffnen kann. Für unseren Garagenmotor gibt es glücklicherweise keinen WLAN Adapter vom Hersteller, so dass wir die Sache selber in die Hand nehmen können.

## These
Der Drucktaster macht im Grunde nichts, ausser 2 Kabel kurz miteinander zu verbinden. Durch die Installation eines Relais, welches schliesst und kurz darauf automatisch wieder öffnet, kann man einen solchen Tastendruck nachahmen. Dieses Relais sollte via WLAN mit einem MQTT Broker verbunden sein und so das entsprechende Kommando erhalten. Die MQTT Nachricht / Kommando soll durch eine mini vue.js Web Applikation erzeugt werden.

## Experiment
### Manueller Test
Als Erstes habe ich geprüft, dass man einen Tastendruck durch das Zusammenhalten von 2 Kabeln nachahmen kann. Hierzu habe ich einfach an die gleichen Steckplätze an denen der Taster angeschlossen ist 2 Kabel angeschlossen und die Kabelenden kurz zusammen gehalten. Wie erwartet öffnete sich das Tor und durch erneutes Zusammenhalten schloss sich das Tor wieder. Die Planung konnte weiter gehen.

### Die Hardware
Da ich für mein IoT Installationen gerne Tinkerforge Module verwende, habe ich mich für folgende Komponenten entschieden
- [Master Brick 2.1](https://www.tinkerforge.com/en/doc/Hardware/Bricks/Master_Brick.html) (ca 30€)
- [WIFI Master Extension 2.0](https://www.tinkerforge.com/en/doc/Hardware/Master_Extensions/WIFI_V2_Extension.html) (ca 30€)
- [Industrial Quad Relay Bricklet 2.0](https://www.tinkerforge.com/en/doc/Hardware/Bricklets/Industrial_Quad_Relay_V2.html) (ca 30€)
- USB Kabel, USB Netzteil, Verbindungskabel zwischen Master und Relay (ca 10€)

Da ich bisher die Wifi Master Erweiterung noch nicht ausprobiert hatte, gab es für mich 2 Optionen. 

**Option 1**
Die Wifi Implementation ist so gut, dass ich einen Hotspot von dem Modul aufbauen lasse, was zur Folge hätte das man mit dem Handy zum Schalten in das WLAN wechseln muss. 

**Option 2**
Das Tinkerforge Wifi Module wird mit meinem IoT WLAN als normaler WLAN Client verbunden. 

Nach den ersten Tests habe ich mich schnell für die zweite Variante entschieden.
- es gibt keine sinnvolle Möglichkeit die mini Web Applikation bereitzustellen, da man in dem WLAN "gefangen" war
- Da es keine Verdingung irgendwo hin gab konnte kein Logging erfolgen
- aus dem gleichen Grund viel MQTT als Kommunikationskanal weg.

Der Zusammenbau der Komponenten ist super einfach. Das WiFi Modul wird auf den Master gesteckt, das Relais mit dem Master verbunden, dann via USB Kabel mit einem Rechner verbinden und mittels Brickv App die initiale WLAN Konfiguration einstellen. Danach kann der Stack vom Computer getrennt und mit USB Netzteil betrieben werden. Ab diesem Zeitpunkt ist es über die IP Verbindung erreichbar. Natürlich habe ich die Installation am Garagentormotor noch nicht vorgenommen, sondern erst nachdem alles ordentlich funktionierte.

### Mosquitto MQTT Broker installieren
Ich verwende einen RaspberryPi 3B+ mit Raspbian Linux und apt-get zur Installation.

```shell
apt-get install -y mosquitto mosquitto-clients

/etc/init.d/mosquitto status
● mosquitto.service - LSB: mosquitto MQTT v3.1 message broker
   Loaded: loaded (/etc/init.d/mosquitto; generated; vendor preset: enabled)
   Active: active (running) since Sun 2020-03-15 08:43:55 UTC; 43s ago
     Docs: man:systemd-sysv-generator(8)
   CGroup: /system.slice/mosquitto.service
           └─22408 /usr/sbin/mosquitto -c /etc/mosquitto/mosquitto.conf

Mar 15 08:43:55 rasp-wlan0 systemd[1]: Starting LSB: mosquitto MQTT v3.1 message broker...
Mar 15 08:43:55 rasp-wlan0 mosquitto[22402]: Starting network daemon:: mosquitto.
Mar 15 08:43:55 rasp-wlan0 systemd[1]: Started LSB: mosquitto MQTT v3.1 message broker.
```

Um den Broker zu testen brauchen wir 2 Konsolen. Terminal 1 melden wir uns für alle Topics an und mit dem zweiten Terminal senden wir eine Test Nachricht.

```properties
terminal_1: mosquitto_sub -v -t '#'
```

```properties
terminal_2: mosquitto_pub -h localhost -t test_channel -m "Hello Mosquitto"
```

Als Ergebnis erscheint nun die gesendete Nachricht im ersten Terminal.
```properties
terminal_1: mosquitto_sub -v -t '#'
terminal_1: Hello Mosquitto
```

### Tinkerforge Relais an Mosquitto/MQTT anbinden
Als erstes müssen die Tinkerforge MQTT Bindings heruntergeladen werden, welche unter [https://www.tinkerforge.com/de/doc/Downloads.html](https://www.tinkerforge.com/de/doc/Downloads.html#downloads-bindings-examples) verfügbar sind und anschliessend mit **unzip** entpackt werden. Das darin befindliche **tinkerforge_mqtt** python Programm nach /usr/local/bin kopieren und ausführbar machen. Beim Aufruf des Programms werden gegebenenfalls noch weitere python Bibliotheken als fehlend gemeldet, die dann wie im Beispiel nachinstalliert werden können.

```shell
sudo cp tinkerforge_mqtt /usr/local/bin
sudo chmod +x /usr/local/bin/tinkerforge_mqtt

/usr/local/bin/tinkerforge_mqtt 
CRITICAL:root:requiring paho 1.3.1 or newer.

pip install paho-mqtt
```
Sobald das Programm ohne Fehlermeldung startet, können wir es mit der IP Adresse des WiFi Moduls verbinden.
```shell
/usr/local/bin/tinkerforge_mqtt --ipcon-host WIFI_MODUL_IP --show-payload --global-topic-prefix=tinkerforge/garage
```
Durch die Option "show-payload" werden alle Nachrichten an den MQTT Broker in der Logdatei gespeichert, was beim debuggen hilfreich ist.

Jetzt kann der Befehl zum Relais kurzzeitigen Schliessen (monoflop) geschickt werden. In diesem Beispiel wird der Kanal 1 für 5 Sekunden geschlossen, was genug Zeit sein sollte um die Wirksamkeit in der brickv Anwendung zu sehen. Die UID muss durch die des Relais ersetzt werden.
```properties
mosquitto_pub -t 'tinkerforge/tiefgarage/request/industrial_quad_relay_v2_bricklet/<uid>/set_monoflop' -m '{"channel": 1, "value": true, "time": 5000}'
```
### Web Applikation bauen
Als nächstes erstellen wir eine einfache Vue.js Applikation, die den entsprechenden Befehl an den MQTT Broker sendet, sobald man den Knopf drückt. Dazu erstellen wir einen neuen Ordner **~/sandbox/GarageDoor** und erzeugen darin die folgenden Dateien:

**package.json**
```json
{
  "name": "GarageDoor",
  "description": "A Vue.js project",
  "version": "1.0.0",
  "author": "Sascha Curth <github@sascha-curth.de>",
  "license": "MIT",
  "private": true,
  "scripts": {
    "dev": "cross-env NODE_ENV=development webpack-dev-server --open --hot",
    "build": "cross-env NODE_ENV=production webpack --progress --hide-modules"
  },
  "dependencies": {
    "vue": "^2.5.11",
    "vue-mqtt": "^2.0.3"
  },
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not ie <= 8"
  ],
  "devDependencies": {
    "babel-core": "^6.26.0",
    "babel-loader": "^7.1.2",
    "babel-preset-env": "^1.6.0",
    "babel-preset-stage-3": "^6.24.1",
    "cross-env": "^5.0.5",
    "css-loader": "^0.28.7",
    "file-loader": "^1.1.4",
    "vue-loader": "^13.0.5",
    "vue-template-compiler": "^2.4.4",
    "webpack": "^3.6.0",
    "webpack-dev-server": "^2.9.1"
  }
}
```
**webpack.config.js**
```js
var path = require('path')
var webpack = require('webpack')

module.exports = {
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader'
        ],
      },      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
          }
          // other vue-loader options go here
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
```

**index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>GarageDoor</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="dist/build.js"></script>
  </body>
</html>
```

**src/App.vue**
```html
<template>
  <div id="app">
    <publish></publish>
  </div>
</template>

<script>
import Publish from './components/Publish'
export default {
  name: 'app',
  components: {
    Publish
  },
  mounted () {
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.sub {
  width: 31%;
  float: left;
  border: 1px solid #ccc;
  margin: 20px 1%;
  padding: 20px 0;
}
button {
  padding: 80px 160px;
  font-size: 72px;
  margin: 60px;
}
</style>
```

**src/main.js**
```js
import Vue from 'vue'
import App from './App'
import VueMqtt from 'vue-mqtt'

Vue.use(VueMqtt, 'ws://<IP>:1883/ws', {clientId: 'GarageDoor-' + parseInt(Math.random() * 100000)})

new Vue({
  el: '#app',
  render: h => h(App)
})
```

**src/components/Publish.vue**
```vue
<template>
  <div class="publish">
    <button @click="publish1">Garage</button>
  </div>
</template>

<script>
export default {
  methods: { 
    publish1 () {
      this.$mqtt.publish('tinkerforge/tiefgarage/request/industrial_quad_relay_v2_bricklet/<UID>/set_monoflop', '{"channel": 0, "value": true, "time": 1000}')
    }
  },
  mqtt: {
    'VueMqtt/publish1' (data, topic) {
      console.log(topic + ': ' + String.fromCharCode.apply(null, data))
    }
  }
}
</script>
```

Einmalig die Packet installation durchführen
```shell
npm install
```

Die Entwicklungsumgebung starten, welche automatisch ein neues Browserfenster mit der neuen App öffnet. Durch drücken des Button sollte jetzt die Nachricht auf dem MQTT Bus gesendet werden, was mittels moquitto_sub geprüft werden kann.
```shell
npm run dev
```

Wenn alles wie gewünscht funktioniert, wird der build gestartet.
```
npm run build
```

Nach dem erfolgreichen build befindet sich die statischen Resourcen im **dist** Ordner, welcher in den DocumentRoot Ordner unter **/var/www/html/garagedoor** kopiert wird.

### Web Applikation via Webserver bereitstellen
Hierzu benötigen wir zunächste einen Webserver, der die zukünftige Applikation bereitstellen kann. 

```shell
apt-get install lighttpd
```
In der Standard Konfiguration befindet sich das DocumentRoot unter **/var/www/html/**.

## Sicherheit geht vor
Jetzt kann theoretisch jeder, der Zugang zu diesem WLAN hat, Befehle an den MQTT Broker senden oder sich direkt mit dem WiFi Master über die brickv Anwendung verbinden. Im Folgenden werden die Kommunikation verschlüsselt und eingeschränkte Benutzerrechte eingeführt. Voraussetzung für eine SSL/TLS Verbindung ist ein gültiges Zertifikat. Wie man mit **letsencrpyt** ein kostenloses und von allen Browsern akzeptiertes Zertifikat erstellt ist im Kompendium Artikel "...to be described..." beschrieben.

### Lighthttpd mit SSL
Die Anpassung des LightHttp Webservers ist minimal und das folgende Beispiel sendet für jede Anfrage mit dem unverschlüsselten **http** Protokoll eine automatische Weiterleitung auf den Port 443, welcher mittels SSL verschlüsselt ist. Das hat den Vorteil, das selbst wenn man versehentlich eine unverschlüsselte Anfrage stellt, diese sofort auf **https** umgeleitet wird ohne irgendwelche sensiblen Daten zu übermitteln.

**/etc/lighttpd/lighttpd.conf**
```shell
...
aktuelle Konfiguration erweitern
...

$SERVER["socket"] == ":443" {
  ssl.engine = "enable"
  ssl.pemfile = "/etc/letsencrypt/live/<FQDN>/web.pem" # Combined Certificate
  ssl.ca-file = "/etc/letsencrypt/live/<FQDN>/chain.pem" # Root CA
  server.name = "<FQDN>" # Domain Name OR Virtual Host Name
  accesslog.filename = "/var/log/lighttpd/domain_access.log"
}
 
$HTTP["scheme"] == "http" {
  # This should be always true for insecure incomming connections:
  $HTTP["host"] =~ ".*" {
    # redirect to https, port 443:
    url.redirect = (".*" => "https://%0$0")
  }
}
```

### MQTT / mosquitto Broker verschlüsselte Kommunikation
Die nachfolgende Konfiguration limitiert die unverschlüsselte MQTT Protokoll Kommunikation auf den localhost und somit nur für lokale Prozesse. Das websockets Protokoll ist auf allen Netzwerkschnittstellen verfügbar (Port 8883) und verwendet das benannte SSL/TLS Zertifikat. Um die Zugriffe auf authentifizierte Nutzer zu beschränken, wird zusätzliche zur acl und password Konfiguration, **allow_anonymous** auf **false** gestellt.

**/etc/mosquitto/mosquitto.conf**
```shell
# Place your local configuration in /etc/mosquitto/conf.d/
#
# A full description of the configuration file is at
# /usr/share/doc/mosquitto/examples/mosquitto.conf.example

pid_file /var/run/mosquitto.pid

persistence false

log_dest file /var/log/mosquitto/mosquitto.log

include_dir /etc/mosquitto/conf.d

listener 1883 localhost
protocol mqtt

listener 8883
protocol websockets
certfile /etc/letsencrypt/live/<FQDN>/cert.pem
cafile /etc/letsencrypt/live/<FQDN>/chain.pem
keyfile /etc/letsencrypt/live/<FQDN>/privkey.pem

acl_file /etc/mosquitto/conf.d/acl
password_file /etc/mosquitto/conf.d/passwd
allow_anonymous false  # Kein Zugriff für Benutzer ohne Passwort
```
Die ACL Konfiguration erlaubt dem "admin" Nutzer alle Topics zu lesen und zu schreiben, während der tinkerforge Nutzer nur auf den topic prefix "tinkerforge/garage" Zugriff hat. In diesem Beispiel wird dieser Nutzer sowohl für tinkerfoge_mqtt Programm als auch für die Web Applikation verwendet. Bei Bedarf können beide Nutzer separiert werden und dann z.b. dem Web App Nutzer nur "write" Rechte gegeben werden und dem tinkerforge_mqtt Nutzer nur "read".

**/etc/mosquitto/conf.d/acl**
```shell
# admin darf alles
user admin
topic readwrite #
topic readwrite $SYS/#
 
# Tinkerforge_mqtt und Web App Nutzer
user tinkerforge
topic readwrite tinkerforge/garage/#
```
Um die beiden Nutzer, admin und tinkerforge, anzulegen und ein Passwort zu vergeben ist das Programm **mosquitto_passwd** zu verwenden.
```shell
mosquitto_passwd /etc/mosquitto/conf.d/passwd admin
mosquitto_passwd /etc/mosquitto/conf.d/passwd tinkerforge
```

### Web App anpassen
- Der Full Qualified Domain Name (FQDN) wird konfiguriert, so dass er mit dem ausgestellten SSL Zertifikat übereinstimmt.
- der Port wird von 1883 auf 8883 umgestellt
- Das Protokoll wird von **ws** (websocket) zu **wss** (secure websocket) umgestellt
- Username und Passwort wird konfiguriert

**src/main.js**
```js
...
Vue.use(VueMqtt, 'wss://<FQDN>:8883/ws', {clientId: 'GarageDoor-' + parseInt(Math.random() * 100000), username: '<NUTZERNAME>', password: '<PASSWORT>'})
...
```

```shell
npm run dev
npm run build
```

Nach dem erfolgreichen build befindet sich die statischen Resourcen im **dist** Ordner, welcher in den lighthttpd DocumentRoot Ordner unter **/var/www/html/garagedoor** kopiert wird.

### Brick Master Passwort Schutz
Mit der brickv Applikation kann man in der Wifi 2.0 Extension unter "Secret" einen Authentifizierungs Token definieren und "Use Authentication" aktivieren. Wichtig hierbei, wenn der Token verloren geht, muss ein Reset durchgeführt werden. (...to be decribed ... ) Zusätzlich gilt zu beachten, das die Kommunikation weiterhin, abgesehen von der WPA2 Verschlüsselung, im Klartext erfolgt und somit am WLAN AP mitgelesen werden kann. Hier empfiehlt es sich den Rasperry als WLAN AP für die IoT Geräte zu betreiben (siehe: [Raspberry Pi 2/3/4 als WLAN/WiFi AccessPoint](/kompendium/004_Raspberry_WIFI_Access_Point.html)).


### Tinkerforge_MQTT als Service einrichten
Das verwendete Broker Token, der neue Broker Port und die dazugehörigen Nutzername und Passwort muss nun auch dem tinkerforge_mqtt mitgeteilt werden. Bei Verwendung von *systemd* kann die service Definition wie folgt aussehen. Es gilt zu beachten, das tinkerforge_mqtt nicht via Secure Websocket kommuniziert, sondern mqtt gegen den localhost verwendet.

**/etc/systemd/system/tinkerforge_mqtt.service**
```shell
[Unit]
Description=Tinkerforge MQTT Bindings

# Enable if brickd is running locally
#After=brickd.service

# Enable if mosquitto is running locally
After=mosquitto.service

[Service]
ExecStart=/usr/local/bin/tinkerforge_mqtt --ipcon-auth-secret <TOKEN> --broker-host localhost --broker-port 1883 --broker-username <USERNAME> --broker-password <PASSWORT> --ipcon-host <IP ADRESSE DER WIFI EXTENSION> --show-payload --global-topic-prefix=tinkerforge/garage

[Install]
WantedBy=multi-user.target
```

Nachdem die Konfiguration erfolgt ist, kann der Dienst gestartet werden.
```shell
systemctl daemon-reload
systemctl enable tinkerforge_mqtt

systemctl status tinkerforge_mqtt
● tinkerforge_mqtt.service - Tinkerforge MQTT Bindings
   Loaded: loaded (/etc/systemd/system/tinkerforge_mqtt.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2020-03-22 13:18:35 UTC; 2 days ago
 Main PID: 13536 (python)
   CGroup: /system.slice/tinkerforge_mqtt.service
           └─13536 python /usr/local/bin/tinkerforge_mqtt --ipcon-auth-secret <TOKEN> --broker-host localhost --broker-port 1883 --broker-username <USERNAME> --broker-password <PASSWORT> --ipcon-host <IP ADRESSE DER WIFI EXTENSION> --show-payload --global-topic-prefix=tinkerforge/garage

Mar 22 13:18:35 rasp-wlan0 systemd[1]: Started Tinkerforge MQTT Bindings
```

## Ergebnis
Zusätzlich zu dem Drucktaster und der Funkfernbedienung habe ich nun einen Weg das Gargentor mit dem Handy zu öffnen. Die Kommuikation ist neben der WPA2 Verschlüsselung des WLANs zusätzlich via https und secure websockets geschützt. Da aussser mir niemand Zugang zum Raspberry WLAN AP hat, ist der portentielle Angriffsvektor über tcpdump quasi nicht existent, aber die Tatsache das die Tinkerforge IP Kommunikation nur durch die Wifi WPA2 Verschlüsselung geschützt ist gefällt mir nicht. Das kann man leider derzeit nicht ändern, was vermutlich an den Fähigkeiten des Wifi Modules liegt. Um das Gargentor zu öffnen sind jetzt folgende Dinge notwendig:

- Browser
- WLAN Zugang
- Web App URL

Da MQTT Nutzer und Passwort in der Web App im Klartext vorliegen müssen, werde ich die Seite noch zusätzlich mit einer Nutzer Authentifizierung erweitern. Zusätzlich könnte ich das Passwort auch automatisert neu generieren und in die App einbauen oder pro authentifizierten Benutzer setzen. Das wird jedoch ein eigenes Projekt zu einem späteren Zeitpunkt.

Alles in Allem, bin ich mit der Lösung sehr zufrieden und insbesondere wenn man mal den Haustürschlüssel oder die Fernbedienung nicht zur Hand hat, unglaublich komfortable.

