import './style.css'
import { Cartesian3, Math as CesiumMath, Terrain, Transforms, Viewer, Model, Ion, Resource, HeadingPitchRange } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import axios from 'axios';

const cesiumDiv = document.querySelector('#app');
const submitBtn = document.querySelector('#submit-btn');
const fileInput = document.querySelector('#fileInput');

const postAddress = import.meta.env.VITE_UPLOAD_ADDRESS;

Ion.defaultAccessToken = import.meta.env.CESIUM_API_KEY;

const viewer = new Viewer(cesiumDiv, {
  terrain: Terrain.fromWorldTerrain(),
});

viewer.camera.flyTo({
  destination: Cartesian3.fromDegrees(21.010282, 52.220536, 400),
  orientation: {
    heading: CesiumMath.toRadians(0.0),
    pitch: CesiumMath.toRadians(-45.0),
  }
});

submitBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) return;

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const loadingScreen = document.querySelector('.loading-screen');
  const loadingText = document.querySelector('.loading-text');
  
  try {
    loadingScreen.style.display = 'flex';
    
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(postAddress, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (!response.data?.output_file) return;

    const fileName = response.data.output_file.split('/').pop();
    const modelUrl = `/shared/output/${fileName}`;
    const resource = new Resource({ url: modelUrl });

    const modelPosition = Cartesian3.fromDegrees(21.010282, 52.220536, 155);
    const modelMatrix = Transforms.eastNorthUpToFixedFrame(modelPosition);
    const model = await Model.fromGltfAsync({
      url: resource,
      modelMatrix: modelMatrix,
      scale: 1,
    });

    viewer.scene.primitives.add(model);
    
    model.readyEvent.addEventListener(async () => {
      if (!model.boundingSphere) {
        console.warn("Model ready but has no bounding sphere");
        return;
      }

      loadingText.textContent = 'Wykonujemy niesamowicie skomplikowane transformacje \u{1F913}';
      await delay(4000);
      
      loadingText.textContent = 'Już prawie gotowe \u{1F4AB}';
      await delay(2500);
      
      viewer.camera.flyToBoundingSphere(model.boundingSphere, {
        duration: 2.0,
        offset: new HeadingPitchRange(0, CesiumMath.toRadians(-45.0), model.boundingSphere.radius * 2.5),
      });
      
      await delay(2000);
      loadingScreen.style.display = 'none';
    });

  } catch (error) {
    console.error('Error:', error);
    loadingScreen.style.display = 'none';
  }
});