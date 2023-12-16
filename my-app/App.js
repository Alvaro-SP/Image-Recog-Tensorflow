import React from 'react';
import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { StatusBar } from 'expo-status-bar';
import Canvas from 'react-native-canvas';
import { Switch } from 'react-native-paper';
import AnimatedLoader from "react-native-animated-loader";
import Icon from 'react-native-vector-icons/FontAwesome';
import { StyleSheet, Button, View, Text, Alert, Dimensions, LogBox, useColorScheme, } from 'react-native';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import { Camera } from 'expo-camera';
// Importamos librerias necesarias para el modelo personalizado
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native'
import * as FileSystem from 'expo-file-system';
import Tflite from 'tflite-react-native';
const TensorCamera = cameraWithTensors(Camera);
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const modelJSON = require('./assets/models/model.json')
const modelWeights = [require('./assets/models/group1-shard1of2.bin'), require('./assets/models/group1-shard2of2.bin')];
LogBox.ignoreAllLogs(true);
let tflite = new Tflite();
export default function App() {
  const [model, setModel] = useState()
  const [model2, setModel2] = useState()
  let context = useRef()
  const canvas = useRef()
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const textureDims = Platform.OS === 'ios'
    ? { height: 1920, width: 1080 }
    : { height: 1200, width: 1600 };
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [stateloader, setStateloader] = useState("false");

  useEffect(() => {
    const initializeTensorFlow = async () => {
      try {
        await tf.ready();
        tf.setBackend('rn-webgl');
        console.log('1. TensorFlow is ready');
      } catch (error) {
        console.error('Error initializing TensorFlow:', error);
      }
    };
    const loadModel = async () => {
      try {
        // Carga del modelo diferida
        // const loadedModel = await tf.loadLayersModel(
        //   bundleResourceIO(modelJSON, modelWeights)
        // )
        // carga del modelo ssd
        // const loadedModel2 = await cocoSsd.load();
        // setModel2(loadedModel2);
        const loadedModel = await tflite.
          console.log('2. Modelo cargado exitosamente');
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };
    const requestCameraPermission = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        console.log('3. Cámara lista');

        setStateloader("true")
      } catch (error) {
        console.error('Error requesting camera permission:', error);
      }
    };
    const initializeApp = async () => {
      if (isCameraOn) {
        setStateloader("Cargando Tensorflow...")
        await initializeTensorFlow();
        setStateloader("Cargando Modelo...")

        await loadModel();
        setStateloader("Iniciando camara...")

        await requestCameraPermission();

      }
    };
    // if (!model) {
    initializeApp();
    // }
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    console.log(isDarkTheme);
  };
  function handleCameraStream(images) {
    const loop = async () => {
      try {
        const nextImageTensor = images.next().value
        if (!model || !nextImageTensor) throw new Error("no model")
        // Redimensionar la imagen según las dimensiones esperadas por el modelo
        const resizedImage = tf.image.resizeBilinear(nextImageTensor, [100, 100]);
        const grayscaleImage = tf.image.rgbToGrayscale(resizedImage);
        const scalar = tf.scalar(255);
        const tensorScaled = grayscaleImage.div(scalar);
        const img = tf.reshape(tensorScaled, [1, 100, 100, 1]);
        console.log("VAMOA PREDECIR")

        // const outputData = await model.run(img);
        // console.log(outputData)
        //! modelo KERAS capas convolucionales y densas
        // const predictions = model.predict(img);
        // console.log(predictions)
        // const predictionsArray = Array.from(await model.predict(img).data());
        // // Establecer un umbral para clasificar como clase positiva o negativa
        // const predictedProbability = predictionsArray[0] > 0.5 ? predictionsArray[0] : 1 - predictionsArray[0];
        // const threshold = 0.5;
        // const predictedClass = predictionsArray[0] > threshold ? 1 : 0;

        // console.log(`Detectado: ${predictedClass == 1 ? 'Mapache' : 'Tortuga'}`);
        // console.log(`Predicted probability: ${predictedProbability.toFixed(4) * 100} %`);


        // console.log(predictionsArray)
        // // Liberar recursos después de cada predicción
        // tf.dispose([resizedImage, grayscaleImage, scalar, tensorScaled, img]);
        // await new Promise(resolve => setTimeout(resolve, 1500));
        //! FIN modelo KERAS capas convolucionales y densas
        requestAnimationFrame(loop)
      } catch (err) {
        console.error("Error predicting:", err);
      }
      // model2
      //   .detect(nextImageTensor)
      //   .then(predictions => {
      //     drawRectangle(predictions, nextImageTensor)
      //   })
      //   .catch(err => {
      //     console.log(err)
      //   })
      // agregar un sleep

    }
    loop()
  }
  function drawRectangle(predictions, nextImageTensor) {
    if (!context.current || !canvas.current) {
      console.log("no context or canvas")
      return
    }

    console.log(predictions)

    // to match the size of the camera preview
    const scaleWidth = width / nextImageTensor.shape[1]
    const scaleHeight = height / nextImageTensor.shape[0]

    const flipHorizontal = Platform.OS === "ios" ? false : true

    // We will clear the previous prediction
    context.current.clearRect(0, 0, width, height)

    // Draw the rectangle for each prediction
    for (const prediction of predictions) {
      const [x, y, width, height] = prediction.bbox

      // Scale the coordinates based on the ratios calculated
      const boundingBoxX = flipHorizontal
        ? canvas.current.width - x * scaleWidth - width * scaleWidth
        : x * scaleWidth
      const boundingBoxY = y * scaleHeight

      // Draw the bounding box.
      context.current.strokeRect(
        boundingBoxX,
        boundingBoxY,
        width * scaleWidth,
        height * scaleHeight
      )
      // Draw the label
      context.current.fillText(
        prediction.class,
        boundingBoxX - 5,
        boundingBoxY - 5
      )
    }
  }
  const handleCanvas = async can => {
    if (can) {
      can.width = width
      can.height = height
      const ctx = can.getContext("2d")
      context.current = ctx
      ctx.strokeStyle = "green"
      ctx.fillStyle = "red"
      ctx.lineWidth = 4
      canvas.current = can
    }
  }
  const initializeTensorFlow = async () => {
    try {
      await tf.ready();
      tf.setBackend('rn-webgl');
      console.log('1. TensorFlow is ready');
    } catch (error) {
      console.error('Error initializing TensorFlow:', error);
    }
  };
  const loadModel = async () => {
    try {
      // Carga del modelo diferida
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
      console.log('2. Modelo cargado exitosamente');
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };
  const requestCameraPermission = async () => {
    try {
      console.log(isCameraOn)
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log('3. Cámara lista');
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    }
  };
  const initializeApp = async () => {
    if (isCameraOn) {
      await initializeTensorFlow();
      await loadModel();
      await requestCameraPermission();
    }
  };


  const turncamera = async () => {
    setIsCameraOn(!isCameraOn)
    console.log("CAMARA = ", isCameraOn)
    if (isCameraOn) {
      initializeApp();
    }

  }
  useEffect(() => { }, [stateloader]);
  return (
    <View style={[styles.container,
    isDarkTheme
      ? { backgroundColor: 'black' }
      : { backgroundColor: 'white' },]
    }>
      <AnimatedLoader
        visible={stateloader == "true" ? false : true}
        overlayColor="rgba(0,35,255,1)"
        animationStyle={styles.lottie}
        speed={1}>
        <Icon name="android" size={100} color="#fff" />
        <Text style={styles.loadingText}>{stateloader}</Text>
      </AnimatedLoader>
      <View style={styles.navbar}>
        <Icon name="plus" size={25} color="#000" />

        <Text style={styles.navbarText}>IMAGE RECOGNIZER</Text>
        <View style={styles.navbarbutton}>
          <Icon name="eye" size={25} color="#000" />
          <Switch value={isDarkTheme} onValueChange={toggleTheme} />
        </View>
      </View>
      {/* <Button
        title={isCameraOn ? "Turn ON camera" : "Turn OFF camera"}
        onPress={() => turncamera()}
      /> */}

      <TensorCamera
        // Standard Camera props
        style={styles.camera}
        type={Camera.Constants.Type.back}
        // Tensor related props
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        resizeHeight={200}
        resizeWidth={152}
        resizeDepth={3}
        onReady={handleCameraStream}
        autorender={true}
        useCustomShadersToResize={false}
      />

      <Canvas style={styles.canvas} ref={handleCanvas} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: '7%',
    // justifyContent: 'center',
    height: '100%',
  },
  camera: {
    paddingTop: '25%',
    width: '95%',
    height: '95%',
    paddingBottom: '5%',
  },
  canvas: {
    paddingTop: '25%',
    position: 'absolute',
    zIndex: 1000000,
    width: '95%',
    height: '95%',
    paddingBottom: '5%',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 5,
    backgroundColor: '#3498db',
  },
  navbarbutton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '22%',
    padding: 5,
  },
  navbarText: {
    color: '#fff', // Color del texto del navbar
    fontSize: 20,
    fontWeight: 'bold',
  },
  lottie: {
    width: 100,
    height: 100,
    transform: [
      {
        rotate: '360deg', // Por ejemplo, rota 360 grados
      },
    ],
  },
  loadingText: {
    color: '#fff',
    fontSize: 26,
    marginTop: 10,
  },
});
