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
  destination: Cartesian3.fromDegrees(21.010282, 52.2100, 400),
  orientation: {
    heading: CesiumMath.toRadians(0.0),
    pitch: CesiumMath.toRadians(-45.0),
  }
});

submitBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];

  if (!file) return;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(postAddress, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log(response);
    
    if (response.data && response.data.output_file) {
      const containerPath = response.data.output_file;
      const fileName = containerPath.split('/').pop(); 
  
      const modelUrl = `/shared/output/${fileName}`; 
      console.log("Attempting to load model from URL:", modelUrl);
      
      try {
        const resource = new Resource({
          url: modelUrl
        });

        const modelLongitude = 21.010282;
        const modelLatitude = 52.2100;
        const modelHeight = 150;
        const modelPosition = Cartesian3.fromDegrees(modelLongitude, modelLatitude, modelHeight);

        const modelMatrix = Transforms.eastNorthUpToFixedFrame(modelPosition);

        const model = await Model.fromGltfAsync({
          url: resource,
          modelMatrix: modelMatrix, 
          scale: 1,
        });
        
        console.log("Model created, adding to scene");
        viewer.scene.primitives.add(model);

        model.readyEvent.addEventListener(() => {
          console.log("Model ready event fired!");
          
          if (model.boundingSphere) {
            console.log("Flying to model bounding sphere");
            
            console.log(model.boundingSphere.center);
            console.log(model.boundingSphere.radius);
            
            viewer.camera.flyToBoundingSphere(model.boundingSphere, {
              duration: 2.0, 
              offset: new HeadingPitchRange(0, CesiumMath.toRadians(-45.0), model.boundingSphere.radius * 2.5),
              complete: function() { 
                console.log("Camera positioning complete using flyToBoundingSphere");
              }
            });
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
