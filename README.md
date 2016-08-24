# MagicMirror2
Magic Mirror 2.0 that can be controlled by guestures

## Project Documentation
Documentation of the project (German) incl. images can be found at http://blog.thomas-bachmann.com/2016/02/magic-mirror-2-0-mit-gestensteuerung.html. An English documentation and more code projects will follow.

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

## User Interface
The user interface code and documentation will follow.

## Serial Port Communication
The code and documentation for retrieving gesture and presence events via the serial port from the Arduino Uno will follow.

## Google Calendar Reader
The code and documentation for retrieving Google Calendar events will follow.
