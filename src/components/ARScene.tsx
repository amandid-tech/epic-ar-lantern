"use client";
console.log("AR Scene starting...");
import { useEffect, useRef } from "react";

import {
    Engine,
    Scene,
    ArcRotateCamera,
    HemisphericLight,
    Vector3,
    SceneLoader,
    Color4,
    Color3,
    Mesh,
    WebXRDefaultExperience,
} from "@babylonjs/core";

import "@babylonjs/loaders";

export default function ARScene() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            console.log("Canvas not ready yet");
            return;
        }

        console.log("Canvas found, starting engine");

        const engine = new Engine(canvas, true);

        engine.setHardwareScalingLevel(
            window.devicePixelRatio > 1
                ? 1 / window.devicePixelRatio
                : 1
        );

        const scene = new Scene(engine);

        scene.clearColor = new Color4(0, 0, 0, 0);

        const camera = new ArcRotateCamera(
            "camera",
            Math.PI / 2,
            Math.PI / 2.5,
            15,
            Vector3.Zero(),
            scene
        );

        camera.attachControl(canvas, true);

        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene
        );

        light.intensity = 2.2;

        let rootMesh: Mesh | null = null;

        SceneLoader.ImportMesh(
            "",
            "/models/",
            "vesak-lantern.glb",
            scene,
            (meshes) => {
                rootMesh = meshes[meshes.length - 1] as Mesh;
                rootMesh.scaling = new Vector3(0.5, 0.5, 0.5);

                console.log("Model loaded");
            }
        );

        engine.runRenderLoop(() => {
            scene.render();
        });

        window.addEventListener("resize", () => {
            engine.resize();
        });

        return () => {
            engine.dispose();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: "100vw",
                height: "100vh",
                position: "fixed",
                top: 0,
                left: 0,
            }}
        />
    );
}