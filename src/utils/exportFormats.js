export function generateUSDA(trackingData, cameraIntrinsics, projectName, fps = 30) {
  const header = `#usda 1.0
(
    defaultPrim = "World"
    endTimeCode = ${trackingData.length - 1}
    framesPerSecond = ${fps}
    metersPerUnit = 1
    startTimeCode = 0
    timeCodesPerSecond = ${fps}
    upAxis = "Y"
)

def Xform "World"
{
    def Camera "VFXCamera"
    {
        float focalLength = ${cameraIntrinsics.focalLength}
        float horizontalAperture = ${cameraIntrinsics.sensorWidth}
        float verticalAperture = ${cameraIntrinsics.sensorHeight}
        float2 clippingRange = (0.1, 10000)

        float3 xformOp:translate.timeSamples = {
${generateTranslateSamples(trackingData, fps)}
        }

        float3 xformOp:rotateXYZ.timeSamples = {
${generateRotateSamples(trackingData, fps)}
        }

        uniform token[] xformOpOrder = ["xformOp:translate", "xformOp:rotateXYZ"]
    }
}
`;

  return header;
}

function generateTranslateSamples(trackingData, fps) {
  return trackingData
    .map((frame, index) => {
      const frameNumber = Math.round(frame.timestamp * fps);
      return `            ${frameNumber}: (${frame.position.x.toFixed(6)}, ${frame.position.y.toFixed(6)}, ${frame.position.z.toFixed(6)})`;
    })
    .join(',\n');
}

function generateRotateSamples(trackingData, fps) {
  return trackingData
    .map((frame, index) => {
      const frameNumber = Math.round(frame.timestamp * fps);
      return `            ${frameNumber}: (${frame.rotation.x.toFixed(6)}, ${frame.rotation.y.toFixed(6)}, ${frame.rotation.z.toFixed(6)})`;
    })
    .join(',\n');
}

export function generateFBX(trackingData, cameraIntrinsics, projectName, fps = 30) {
  const header = `; FBX 7.4.0 project file
; Created by VFX Tracker Pro
; Project: ${projectName}
; ----------------------------------------------------

FBXHeaderExtension:  {
    FBXHeaderVersion: 1003
    FBXVersion: 7400
    CreationTimeStamp:  {
        Version: 1000
        Year: ${new Date().getFullYear()}
        Month: ${new Date().getMonth() + 1}
        Day: ${new Date().getDate()}
        Hour: ${new Date().getHours()}
        Minute: ${new Date().getMinutes()}
        Second: ${new Date().getSeconds()}
        Millisecond: ${new Date().getMilliseconds()}
    }
    Creator: "VFX Tracker Pro"
    SceneInfo: "SceneInfo::GlobalInfo", "UserData" {
        Type: "UserData"
        Version: 100
        MetaData:  {
            Version: 100
            Title: "${projectName}"
            Subject: "Camera Tracking Data"
            Author: "VFX Tracker Pro"
        }
    }
}

; Object definitions
;------------------------------------------------------------------

Definitions:  {
    Version: 100
    Count: 2
    ObjectType: "Model" {
        Count: 1
    }
    ObjectType: "NodeAttribute" {
        Count: 1
    }
}

; Object properties
;------------------------------------------------------------------

Objects:  {
    Model: 1234567890, "Model::VFXCamera", "Camera" {
        Version: 232
        Properties70:  {
            P: "RotationActive", "bool", "", "",1
            P: "RotationOrder", "enum", "", "",0
            P: "ScalingMax", "Vector3D", "Vector", "",0,0,0
            P: "DefaultAttributeIndex", "int", "Integer", "",0
        }
        Shading: Y
        Culling: "CullingOff"
    }

    NodeAttribute: 9876543210, "NodeAttribute::CameraShape", "Camera" {
        TypeFlags: "Camera"
        Properties70:  {
            P: "FilmWidth", "double", "Number", "",${cameraIntrinsics.sensorWidth}
            P: "FilmHeight", "double", "Number", "",${cameraIntrinsics.sensorHeight}
            P: "FocalLength", "double", "Number", "",${cameraIntrinsics.focalLength}
            P: "FieldOfView", "double", "Number", "",${calculateFOV(cameraIntrinsics)}
        }
        Position: 0, 0, 0
        Up: 0, 1, 0
        LookAt: 0, 0, -1
        ShowInfoOnMoving: 1
        ShowAudio: 0
        AudioColor: 0, 1, 0
        CameraOrthoZoom: 1
    }
}

; Object connections
;------------------------------------------------------------------

Connections:  {
    C: "OO",9876543210,1234567890
}

; Animation data
;------------------------------------------------------------------

Takes:  {
    Current: "Take 001"
    Take: "Take 001" {
        FileName: "Take_001.tak"
        LocalTime: 0,${Math.floor((trackingData.length / fps) * 46186158000)}
        ReferenceTime: 0,${Math.floor((trackingData.length / fps) * 46186158000)}
    }
}
`;

  return header;
}

function calculateFOV(intrinsics) {
  const fovRadians = 2 * Math.atan(intrinsics.sensorWidth / (2 * intrinsics.focalLength));
  return (fovRadians * 180) / Math.PI;
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
