/*
define ids of html file
*/
let apiRb = document.getElementById("api-rb");
//let modelRb = document.getElementById("model-rb");
let apiButtons = document
  .getElementById("api-buttons")
  .getElementsByTagName("button");
let modelButtons = document
  .getElementById("model-buttons")
  .getElementsByTagName("button");
let time1 = 2000;
let time2 = 4000;
let apiTempWrapper = document.getElementById("temp-wrapper-api");
let apiTemp = document.getElementById("api-temp");
let apiTempMin = document.getElementById("api-tempMin");
let apiTempMax = document.getElementById("api-tempMax");
let apiRain = document.getElementById("api-rain");
let apiRainText = document.getElementById("api-rain2");

let modelTempWrapper = document.getElementById("temp-wrapper-model");
let modelImg1 = document.getElementById("model-img1");
let modelImg2 = document.getElementById("model-img2");
let modelTemp = document.getElementById("model-temp");
let modelRain = document.getElementById("model-rain");
let modelRain2 = document.getElementById("model-rain2");

//minmax Scaler function for normalizing
function minMax(val, max, min) {
  return (val - min) / (max - min);
}

//load model with https request
let tempModel;
let rainModel;
async function loadModel() {
  tempModel = await tf.loadLayersModel(
    "https://raw.githubusercontent.com/vintertown/weatherprediction/main/temperature_model/model.json"
  );
  rainModel = await tf.loadLayersModel(
    "https://raw.githubusercontent.com/vintertown/weatherprediction/main/rain_model/model.json"
  );
}
loadModel();

//fetch json from openweatermap api
async function fetchWeather() {
  const response = await fetch(
    "https://api.openweathermap.org/data/2.5/onecall?lat=48.78&lon=9.18&exclude=minutely,hourly,alerts&units=metric&appid=ba4b4c488617ad2931549e76b726bfb8"
  );
  const weather = await response.json();
  return weather;
}

//get curent time from openweathermap api as date format
async function getCurrentTime(day) {
  const response = await fetchWeather();
  const currentTime = await response.daily[day].dt;
  const date = new Date(currentTime * 1000);
  return date;
}

//set date fomat to single day
async function getDay(day) {
  const date = await getCurrentTime(day);
  let m_day;

  switch (date.getMonth()) {
    case 0:
      m_day = 0;
      break;
    case 1:
      m_day = 31;
      break;
    case 2:
      m_day = 59;
      break;
    case 3:
      m_day = 90;
      break;
    case 4:
      m_day = 120;
      break;
    case 5:
      m_day = 151;
      break;
    case 6:
      m_day = 181;
      break;
    case 7:
      m_day = 212;
      break;
    case 8:
      m_day = 243;
      break;
    case 9:
      m_day = 273;
      break;
    case 10:
      m_day = 304;
      break;
    case 11:
      m_day = 334;
      break;
    default:
      m_day = 0;
      break;
  }
  let new_day = m_day + date.getDate();
  return new_day;
}
//get temperature and rain from wethter api json
async function getCurrentTemp(day) {
  const response = await fetchWeather();
  const currentTemp = await response.daily[day].temp.day;
  return currentTemp;
}
async function getCurrentTempMin(day) {
  const response = await fetchWeather();
  const currentTemp = await response.daily[day].temp.min;
  return currentTemp;
}
async function getCurrentTempMax(day) {
  const response = await fetchWeather();
  const currentTemp = await response.daily[day].temp.max;
  return currentTemp;
}
async function getCurrentRain(day) {
  const response = await fetchWeather();
  const currentTemp = await response.daily[day].rain;
  return currentTemp;
}

//get model predictions from tensorflow json
const getModelTempPrediction = (day) => {
  const prediction = tempModel.predict(tf.tensor1d([day])).dataSync()[0];

  return Math.round(prediction * 100) / 100;
};
const getModelRainPrediction = (day) => {
  const prediction = rainModel.predict(tf.tensor1d([day])).dataSync()[0];

  return Math.round(prediction * 1000) / 1000;
};

//toggle between css classes and get data from api's
const predictionClicked = (button, str, day) => {
  if (str === "api") {
    apiTempWrapper.classList.remove("blur");
    apiRb.classList.toggle("sp-r-visible");
    apiTempWrapper.classList.toggle("sp-r-visible");
    apiTempWrapper.classList.toggle("blur");
    apiButtons.forEach((btn) => {
      btn.classList.remove("button-clicked");
    });
    button.classList.add("button-clicked");
    setTimeout(() => {
      getCurrentTemp(day).then((response) => {
        apiTemp.innerHTML = response + "°C";
      });
      getCurrentTempMin(day).then((response) => {
        apiTempMin.innerHTML = response + "°C";
      });
      getCurrentTempMax(day).then((response) => {
        apiTempMax.innerHTML = response + "°C";
      });
      getCurrentRain(day).then((response) => {
        if (response === undefined) {
          apiRain.innerHTML = 0 + " l/m²";
        } else {
          apiRain.innerHTML = response + " l/m²";
        }
        if (response < 5 || response === undefined) {
          apiRainText.innerHTML = "-> not really";
        } else {
          apiRainText.innerHTML = "watch out!";
        }
      });
      apiRb.classList.toggle("sp-r-visible");
      apiTempWrapper.classList.toggle("blur");
    }, 2000);
  } else if (str === "mod") {
    //modelRb.classList.toggle("sp-r-visible");
    modelImg1.classList.toggle("sp-r-visible");
    modelTempWrapper.classList.remove("blur");
    modelTempWrapper.classList.toggle("blur");
    modelButtons.forEach((mdl) => {
      mdl.classList.remove("button-clicked");
    });
    button.classList.add("button-clicked");
    setTimeout(() => {
      modelImg2.classList.toggle("sp-r-visible");
      modelImg1.classList.toggle("sp-r-visible");
      setTimeout(() => {
        getDay(day).then((response) => {
          modelTemp.innerHTML = getModelTempPrediction(response) + "°C";
          modelRain.innerHTML = getModelRainPrediction(response) + " l/m²";
          if (getModelRainPrediction(response) < 5) {
            modelRain2.innerHTML = "-> not really";
          } else {
            modelRain2.innerHTML = "watch out!";
          }
        });

        //modelRb.classList.toggle("sp-r-visible");
        modelImg2.classList.toggle("sp-r-visible");
        modelTempWrapper.classList.toggle("blur");
        time1 = 500;
        time2 = 500;
      }, time1);
    }, time2);
  }
};
