import './style.css'
import { Cartesian3, Math as CesiumMath, Terrain, Transforms, Viewer, Model, Ion, Resource, HeadingPitchRange } from 'cesium';
import "cesium/Build/Cesium/Widgets/widgets.css";
import axios from 'axios';

const cesiumDiv = document.querySelector('#app');
const submitBtn = document.querySelector('#submit-btn');
const fileInput = document.querySelector('#fileInput');

const postAddress = 'http://localhost:7777/file'

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZWQ5NDE3YS1hMTI3LTQ2MWYtYmVkOS1kYzc2NzYyNDkxMjYiLCJpZCI6MjIwMzM3LCJpYXQiOjE3MTc2MDE0NjV9.KsJnRWpgHWqnIU3Cg2nq5lqL29k-u0aovf0v6JtK_LY';
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

  try {
    const loadingScreen = document.querySelector('.loading-screen');
    loadingScreen.style.display = 'flex';

    const loadingText = document.querySelector('.loading-text');
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(postAddress, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data && response.data.output_file) {
      const containerPath = response.data.output_file;
      const fileName = containerPath.split('/').pop(); 
  
      const modelUrl = `/shared/output/${fileName}`; 
      
      try {
        const resource = new Resource({
          url: modelUrl
        });

        const modelLongitude = 21.010282;
        const modelLatitude = 52.220536;
        const modelHeight = 155;
        const modelPosition = Cartesian3.fromDegrees(modelLongitude, modelLatitude, modelHeight);

        const modelMatrix = Transforms.eastNorthUpToFixedFrame(modelPosition);

        const model = await Model.fromGltfAsync({
          url: resource,
          modelMatrix: modelMatrix, 
          scale: 1,
        });
        
        viewer.scene.primitives.add(model);
        model.readyEvent.addEventListener(async () => {
          if (model.boundingSphere) {
            loadingText.textContent = 'Wykonujemy niesamowicie skomplikowane transformacje \u{1F913}';
            await delay(4000);
            
            loadingText.textContent = 'Już prawie gotowe \u{1F4AB}';
            await delay(2500);
            
            viewer.camera.flyToBoundingSphere(model.boundingSphere, {
              duration: 2.0, 
              offset: new HeadingPitchRange(0, CesiumMath.toRadians(-45.0), model.boundingSphere.radius * 2.5),
              complete: function() { 
                console.log("Camera positioning complete using flyToBoundingSphere");
              }
            });
            await delay(2000);
            loadingScreen.style.display = 'none';

          } else {
            console.warn("Model ready but has no bounding sphere");
          }
        });
        
        setTimeout(() => {
          console.log("Timeout reached, checking model status");
          if (!model.ready && model.readyPromise) {
            console.log("Model not ready yet, but has promise - waiting for it");
          }
        }, 10000);
        
      } catch (modelError) {
        console.error('Error loading model:', modelError);
      }
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
});
