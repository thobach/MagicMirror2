# Warning
This repository is outdated and not maintained anymore. Please use https://github.com/MichMich/MagicMirror instead and my modules https://github.com/thobach/MMM-Gestures and https://github.com/thobach/MMM-WunderGround24Hours. 



​


# MagicMirror2
Magic Mirror 2.0 that can be controlled by gestures, based on version 1.0 from https://github.com/MichMich/MagicMirror

## Project Documentation
Documentation of the project (German) incl. images can be found at http://blog.thomas-bachmann.com/2016/02/magic-mirror-2-0-mit-gestensteuerung.html. An English documentation and more code projects will follow.

## Raspberry Pi 3
1.	Download RASPBIAN JESSIE (not LITE) from https://www.raspberrypi.org/downloads/raspbian/
1.	Follow https://www.raspberrypi.org/documentation/installation/installing-images/README.md to install the operating system on an SD card
1.	Insert SD card into Raspberry Pi 3, connect monitor via HDMI, keyboard and mouse via USB and power via Micro USB
1.	Now Raspberry Pi 3 boots RASPBIAN JESSIE
1.	Rotate display: TBD
1.	Enable SSH: in terminal enter "sudo raspi-config", go to "Advanced Config", then "ssh" and enable ssh server
1.	TBC (how to check out web project, configure it, install Chromium, configure Chromium to auto-start in kiosk mode, install Node.js and required packages via npm, configure irsensor.js app to auto-start, etc.)
1.	Connect Arduino via USB to Raspberry Pi, requires that Arduino is wired as described below and has the Arduino sketch from this project already installed 

## Arduino
Collects gesture events from gesture sensor APDS-9960 and distance from distance sensor GP2Y0A21YK (10-80cm), which are then forwarded on the serial port as text.

The circuit for an Arduino Uno:
* Input 1: APDS-9960 on digital pin 2 (interrupt) + I2C (SDA on pin A4, SCL on pin A5) + GND & VCC (3.3V)
* Input 2: GP2Y0A21YK on analog pin 0 (analog) + GND & VCC (5V)
* Output: serial out on USB
  
In order to compile you'll need to copy the following libraries to Arduino's library folder. The libraries are also included in this git repository.
* RunningMedian library, taken from https://github.com/RobTillaart/Arduino/tree/master/libraries/RunningMedian
* DistanceSensor library for GP2Y0A21YK, taken from https://github.com/jeroendoggen/Arduino-distance-sensor-library/tree/master/DistanceSensor
* SparkFun_APDS9960 library for APDS-9960 gesture sensor, taken from https://github.com/sparkfun/APDS-9960_RGB_and_Gesture_Sensor

## IRSensor Node.js App on Raspberry Pi 3
Communication between Raspberry Pi and Arduino happens via the serial port (USB). The Node.js/irsensor.js app from this project creates the connection between the two systems, forwards gesture and distance events to the web user interface via WebSocket communication and also controls the HDMI display to save power if nobody has interacted with the mirror for 5 minutes.

The init.d/node-app-irdistance script can be used to configure the irsensor.js app to be launched automatically on start.

## User Interface
### Weather Module
The weather module is an AngularJS app that uses http://www.chartjs.org/ to display weather information from Weather Underground. See web/weather.html for details and make sure you provide your Weather Underground API key and define a weather station in web/js/config.js.

### Date, Time and Calendar Module
The calendar module is an AngularJS app that displays calendar events of the next two days from various calendars stored in Google Calendar. See web/calendar.html for details and make sure you provide your Google Client API key and calendars to be retrieved in web/js/config.js. When loading calendar.html the first time from a web server (e.g. via "python -m SimpleHTTPServer 8000" ran from the web directory), you'll need to authorize the website to retrieve calendar events from Google Calendar. After a browser refresh you'll see your calendar events in a tabular format.

Further user interface code and documentation will follow.

## Serial Port Communication
The code and documentation for retrieving gesture and presence events via the serial port from the Arduino Uno will follow.
