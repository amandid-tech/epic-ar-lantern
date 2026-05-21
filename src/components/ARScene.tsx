"use client";

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
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;

        // Engine
        const engine = new Engine(canvas, true);

        engine.setHardwareScalingLevel(
            window.devicePixelRatio > 1
                ? 1 / window.devicePixelRatio
                : 1
        );

        // Scene
        const scene = new Scene(engine);

        scene.clearColor = new Color4(0, 0, 0, 0);

        // Camera (fallback for non-AR preview)
        const camera = new ArcRotateCamera(
            "camera",
            Math.PI / 2,
            Math.PI / 2.5,
            15,
            Vector3.Zero(),
            scene
        );

        camera.attachControl(canvas, true);
        camera.lowerRadiusLimit = 8;
        camera.upperRadiusLimit = 25;
        camera.wheelDeltaPercentage = 0.01;

        // Light
        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene
        );

        light.intensity = 2.2;
        light.diffuse = new Color3(1, 0.85, 0.6);
        light.groundColor = new Color3(0.2, 0.1, 0);

        // Lantern reference (IMPORTANT)
        let rootMesh: Mesh | null = null;

        // Load model
        SceneLoader.ImportMesh(
            "",
            "/models/",
            "vesak-lantern.glb",
            scene,
            (meshes) => {
                rootMesh = meshes[meshes.length - 1] as Mesh;

                rootMesh.scaling = new Vector3(0.5, 0.5, 0.5);

                // start hidden until AR starts
                rootMesh.setEnabled(false);

                console.log("Lantern loaded successfully");
            }
        );

        // WebXR
        let xr: WebXRDefaultExperience;

        const setupXR = async () => {
            xr = await scene.createDefaultXRExperienceAsync({
                uiOptions: {
                    sessionMode: "immersive-ar",
                },
            });

            console.log("WebXR initialized");

            // Show model when AR starts
            xr.baseExperience.onStateChangedObservable.add((state) => {
                if (state === 2) {
                    // XR IN SESSION
                    if (rootMesh) {
                        rootMesh.setEnabled(true);
                        rootMesh.position = new Vector3(0, 0, 3);
                    }
                }
            });
        };

        setupXR();

        // Render loop
        engine.runRenderLoop(() => {
            scene.render();
        });

        // Resize
        const resize = () => engine.resize();
        window.addEventListener("resize", resize);

        return () => {
            window.removeEventListener("resize", resize);
            scene.dispose();
            engine.dispose();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-screen h-screen touch-none"
        />
    );
}