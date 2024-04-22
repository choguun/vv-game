import * as THREE from "three";
import { Inputs } from "../core/inputs";
export type HudOptions = {
    armMesh?: THREE.Object3D;
    armPosition?: THREE.Vector3;
    armQuaternion?: THREE.Quaternion;
    blockPosition?: THREE.Vector3;
    blockQuaternion?: THREE.Quaternion;
    armColor?: string;
};
export declare class Hud extends THREE.Group {
    options: HudOptions;
    private mixer;
    private armSwingClip;
    private blockSwingClip;
    private blockPlaceClip;
    private swingAnimation;
    private placeAnimation;
    constructor(options?: Partial<HudOptions>);
    /**
     * Connect the HUD to the given input manager. This will allow the HUD to listen to left
     * and right clicks to play HUD animations. This function returns a function that when called
     * unbinds the HUD's keyboard inputs.
     *
     * @param inputs The {@link Inputs} instance to bind the HUD's keyboard inputs to.
     * @param namespace The namespace to bind the HUD's keyboard inputs to.
     */
    connect: (inputs: Inputs, namespace?: string) => () => void;
    /**
     * Set a new mesh for the HUD. If `animate` is true, the transition will be animated.
     *
     * @param mesh New mesh for the HUD
     * @param animate Whether to animate the transition
     */
    setMesh: (mesh: THREE.Object3D | undefined, animate: boolean) => void;
    private setArmMesh;
    private setBlockMesh;
    /**
     * Generates a "swing" animation clip.
     *
     * @param pInitial Initial position
     * @param qInitial Initial quaternion
     * @param name Name of the clip
     * @returns Animation clip
     */
    private generateSwingClip;
    /**
     *
     * Generates a "place" animation clip.
     *
     * @param pInitial Initial position
     * @param qInitial Initial quaternion
     * @param name Name of the clip
     * @returns Animation clip
     */
    private generatePlaceClip;
    /**
     *
     * Update the arm's animation. Note that when a hud is attached to a control,
     * `update` is called automatically within the control's update loop.
     */
    update(delta: number): void;
    /**
     * Play the "swing" animation.
     */
    private playSwing;
    /**
     * Play the "place" animation.
     */
    private playPlace;
}
//# sourceMappingURL=hud.d.ts.map