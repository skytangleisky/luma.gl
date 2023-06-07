import {Device, Buffer, RenderPass} from '@luma.gl/api';
import {Model, ModelProps} from '@luma.gl/engine';
import {ScenegraphNode, ScenegraphNodeProps} from './scenegraph-node';

export type ModelNodeProps = ScenegraphNodeProps & ModelProps & {
  managedResources?: any[];
}

export class ModelNode extends ScenegraphNode {
  readonly model: Model;
  bounds: [number[], number[]] | null = null;

  AfterRender = null;
  managedResources: any[];

  // override callbacks to make sure we call them with this
  onBeforeRender = null;
  onAfterRender = null;

  constructor(deviceOrModel: Model | Device, props: ModelNodeProps = {}) {
    super(props);

    // Create new Model or used supplied Model
    if (deviceOrModel instanceof Model) {
      this.model = deviceOrModel;
      this._setModelNodeProps(props);
    } else {
      this.model = new Model(deviceOrModel, props);
    }

    this.managedResources = props.managedResources || [];
  }

  override setProps(props: ModelNodeProps) {
    super.setProps(props);
    this._setModelNodeProps(props);
    return this;
  }

  override getBounds(): [number[], number[]] | null {
    return this.bounds;
  }

  override destroy(): void {
    if (this.model) {
      this.model.destroy();
      // @ts-expect-error
      this.model = null;
    }

    this.managedResources.forEach((resource) => resource.destroy());
    this.managedResources = [];
  }

  // Expose model methods
  draw(renderPass?: RenderPass) {
    // Return value indicates if something was actually drawn
    return this.model.draw(renderPass);
  }

  setUniforms(uniforms: Record<string, any>): this {
    this.model.setUniforms(uniforms);
    return this;
  }

  setAttributes(attributes: Record<string, Buffer>): this {
    this.model.setAttributes(attributes);
    return this;
  }

  updateModuleSettings(moduleSettings: Record<string, any>) {
    this.model.updateModuleSettings(moduleSettings);
    return this;
  }

  // PRIVATE

  _setModelNodeProps(props: ModelNodeProps) {
    this.model.setProps(props);
  }
}
