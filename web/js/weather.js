// AngularJS Weather App using Weather Underground Data

var weatherCtrlDef = function($scope, $http, getWeather) {
	
	// init using global variables
	getWeather.initWeather(weatherUndergroundApiKey, weatherStation);
	
	// wrap load function to be called repeatedly
	var load = function(){
		getWeather.load(function (data){
			$scope.weather = data;
		});
	}
	
	load();
	
	// refresh data every 15 minutes
	setInterval(load, 15 * 60 * 1000);

};

var getWeather = function ($http) {

	// view model
	var weatherService = {
		"weatherUndergroundApiKey" : "",
		"weatherStation" : "",
		"weather" : {
			"now" : { "temp" : "N/A", "icon" : "N/A" },
			"today" : { "min" : "N/A", "max" : "N/A" }, 
			"tomorrow" : { "min" : "N/A", "max" : "N/A" }
		}
	};
	
	weatherService.initWeather = function (weatherUndergroundApiKey, weatherStation) {
	
		weatherService.weatherUndergroundApiKey = weatherUndergroundApiKey;
		weatherService.weatherStation = weatherStation;
		
	};
	
	parseCurrentData = function (now, weatherService){
	
		weatherService.weather.now.temp = Math.round(now.temp_c);
		weatherService.weather.now.icon = 'img/VCloudsWeatherIcons/' + 
			now.icon_url.replace('http://icons.wxug.com/i/c/k/', '').replace('.gif', '.png');

	}
	
	parseForecastData = function (today, tomorrow, weatherService){
	
		weatherService.weather.today.min = today.low.celsius;
		weatherService.weather.today.max = today.high.celsius;
		weatherService.weather.tomorrow.min = tomorrow.low.celsius;
		weatherService.weather.tomorrow.max = tomorrow.high.celsius;

	}
	
	plot24HourForecast = function (data){
	
		var colorLightGrey = "rgba(220,220,220,0.2)";
		var colorGrey = "#dcdcdc";
		var colorBlueGrey = "rgba(151,187,205,0.2)";
		var colorWhite = "#fff";
		var colorBlue = "#97bbcd";
		
		// internal forecast structure
		var forecastData = {};

		// extract only relevant information
		for (var i in data.hourly_forecast) {
		
			var forecast = data.hourly_forecast[i];
			
			forecastData[i] = {
				'hour': parseInt(forecast.FCTTIME.hour),
				'temp': parseInt(forecast.temp.metric),
				'pop': parseInt(forecast.pop),
				'qpf': parseInt(forecast.qpf.metric)
			};
			
		}
		
		// data sets for graphs per hour (temp, POP, QPF)
		var hours = [];
		var temps = []
		var pops = [];
		var qpfs = [];
		
		var maxTempForecast = -100;
		var minTempForecast = 100;
		
		var maxQpfForecast = -100;

		// iterate through next 24 hours, extra data sets per graph and dynamic scale information
		for (var i = 0; i < 24; i++) {
		
			var forecast = forecastData[i];
		
			hours[i] = forecast.hour;
			temps[i] = forecast.temp;
			pops[i] = forecast.pop;
			qpfs[i] = forecast.qpf;
			
			// get max forecast temp value
			if (forecast.temp > maxTempForecast){
				maxTempForecast = forecast.temp;
			}
			
			// get min forecast temp value
			if (forecast.temp < minTempForecast){
				minTempForecast = forecast.temp;
			}
			
			// get max forecast qpf value
			if (forecast.qpf > maxQpfForecast){
				maxQpfForecast = forecast.qpf;
			}
			
		}
				
		// graphs' data, labels and colors
		
		// temp
		var dataTemp = {
			labels: hours,
			datasets: [
				{
					fillColor: colorLightGrey,
					strokeColor: colorGrey,
					pointColor: colorGrey,
					pointStrokeColor: colorWhite,
					pointHighlightFill: colorWhite,
					pointHighlightStroke: colorGrey,
					data: temps
				}
			]
		};
		
		// POP
		var dataPop = {
			labels: hours,
			datasets: [
				{
					fillColor: colorBlueGrey,
					strokeColor: colorBlue,
					pointColor: colorBlue,
					pointStrokeColor: colorWhite,
					pointHighlightFill: colorWhite,
					pointHighlightStroke: colorBlue,
					data: pops
				}
			]
		};
		
		// QPF
		var dataQpf = {
			labels: hours,
			datasets: [
				{
					fillColor: colorBlueGrey,
					strokeColor: colorBlue,
					pointColor: colorBlue,
					pointStrokeColor: colorWhite,
					pointHighlightFill: colorWhite,
					pointHighlightStroke: colorBlue,
					data: qpfs
				}
			]
		};
		
		// graphs' scale and line options
		
		Chart.defaults.global.animation = false;

		// temp		
		var stepTemp  = (parseInt(maxTempForecast) - parseInt(minTempForecast)) > 10 ? 2 : 1;
		var maxTemp   = parseInt(maxTempForecast) + 2;
		var startTemp = parseInt(minTempForecast) - 2;
							
		var optionsTemp = {
			bezierCurve : false,
			pointDot : false,				
			scaleOverride: true,
			scaleSteps: Math.ceil((maxTemp-startTemp)/stepTemp),
			scaleStepWidth: stepTemp,
			scaleStartValue: startTemp
			
		};
		
		// POP
		var stepPop  = 20;
		var maxPop   = 100;
		var startPop = 0;
		
		var optionsPop = {
			bezierCurve : false,
			pointDot : false,
			scaleOverride: true,
			scaleSteps: Math.ceil((maxPop-startPop)/stepPop),
			scaleStepWidth: stepPop,
			scaleStartValue: startPop

		};
		
		// QPF
		var stepQpf = 0.5;
		var maxQpf = maxQpfForecast + 1;
		var startQpf = 0;
		
		var optionsQpf = {
			bezierCurve : false,
			pointDot : false,
			scaleOverride: true,
			scaleSteps: Math.ceil((maxQpf-startQpf)/stepQpf),
			scaleStepWidth: stepQpf,
			scaleStartValue: startQpf

		};
		
		// canvas HTML elements to plot graphs
		var ctxTemp = $("#hourlyForecastTemp").get(0).getContext("2d");
		var ctxPop = $("#hourlyForecastPop").get(0).getContext("2d");
		var ctxQpf = $("#hourlyForecastQpf").get(0).getContext("2d");

		// plot graphs
		var chartTemp = new Chart(ctxTemp).Line(dataTemp, optionsTemp);
		var chartPop = new Chart(ctxPop).Line(dataPop, optionsPop);
		var chartQpf = new Chart(ctxQpf).Line(dataQpf, optionsQpf);
		
	}
	
	
	// get weather data from weather underground service
	weatherService.load = function (callback) {
		
		var weatherRequest = function() {
			
			var request = {
				method: 'GET',
				url: 'http://api.wunderground.com/api/' + weatherService.weatherUndergroundApiKey + 
					'/conditions/hourly/forecast/q/' + weatherService.weatherStation + '.json'
			}
		
			return request;
		}
		
		var weatherRequestSuccess = function(data, status, headers, config){
		
			// current weather
			var now = data.current_observation;
			parseCurrentData(now, weatherService);
			
			// weather forecast today and tomorrow
			var today = data.forecast.simpleforecast.forecastday[0];
			var tomorrow = data.forecast.simpleforecast.forecastday[1];
			parseForecastData(today, tomorrow, weatherService);
			
			// update user interface
			callback(weatherService.weather);
			
			// plot 24 hour forecast directly
			// 3 graphs (temperature, percentage of rain - pop, amount of rain - qpfs)
			plot24HourForecast(data);
				
		};
		
		var weatherRequestError = function(data, status, headers, config){
		
			weatherService.weather = { 
				"today" : { "min" : "N/A", "max" : "N/A" }, 
				"tomorrow" : { "min" : "N/A", "max" : "N/A" }
			};
			console.log(status);
			console.log(data);
			
		}
	
		$http(weatherRequest()).success(weatherRequestSuccess).error(weatherRequestError);
		
	};
		
	return weatherService;
	
};

angular.module('weather', []).controller('weatherCtrl', weatherCtrlDef).factory('getWeather', getWeather);
