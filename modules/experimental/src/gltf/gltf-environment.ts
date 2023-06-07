import {Device} from '@luma.gl/api';
import {WebGLDevice} from '@luma.gl/webgl';
import {GL, Texture2D, TextureCube} from '@luma.gl/webgl-legacy';
import {loadImage} from '@loaders.gl/images';

export type GLTFEnvironmentProps = {
  brdfLutUrl: string;
  getTexUrl: (name: string, dir: number, level: number) => string;
  specularMipLevels?: number;
}

/** Cubemap environment for PBR */
export class GLTFEnvironment {
  // TODO - Use Device
  device: WebGLDevice;
  brdfLutUrl: string;
  getTexUrl: (name: string, dir: number, level: number) => string;
  specularMipLevels: number;

  _DiffuseEnvSampler: TextureCube | null = null;
  _SpecularEnvSampler: TextureCube | null = null;
  _BrdfTexture: Texture2D | null = null;

  constructor(device: Device, props: GLTFEnvironmentProps) {
    this.device = WebGLDevice.attach(device);
    this.brdfLutUrl = props.brdfLutUrl;
    this.getTexUrl = props.getTexUrl;
    this.specularMipLevels = props.specularMipLevels || 10;
  }

  destroy(): void {
    if (this._DiffuseEnvSampler) {
      this._DiffuseEnvSampler.destroy();
      this._DiffuseEnvSampler = null;
    }

    if (this._SpecularEnvSampler) {
      this._SpecularEnvSampler.destroy();
      this._SpecularEnvSampler = null;
    }

    if (this._BrdfTexture) {
      this._BrdfTexture.destroy();
      this._BrdfTexture = null;
    }
  }

  /** @deprecated */
  delete() {
    this.destroy();
  }

  makeCube({id, getTextureForFace, parameters}: {
    id: string, 
    getTextureForFace: (dir: number) => Promise<any> | Promise<any>[], 
    parameters: Record<number, number>
  }) {
    const pixels = {};
    TextureCube.FACES.forEach((face) => {
      pixels[face] = getTextureForFace(face);
    });
    return new TextureCube(this.device, {
      id,
      mipmaps: false,
      parameters,
      pixels
    });
  }

  getDiffuseEnvSampler(): TextureCube {
    if (!this._DiffuseEnvSampler) {
      this._DiffuseEnvSampler = this.makeCube({
        id: 'DiffuseEnvSampler',
        getTextureForFace: (dir) => loadImage(this.getTexUrl('diffuse', dir, 0)),
        parameters: {
          [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
          [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
          [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
          [GL.TEXTURE_MAG_FILTER]: GL.LINEAR
        }
      });
    }

    return this._DiffuseEnvSampler;
  }

  getSpecularEnvSampler(): TextureCube {
    if (!this._SpecularEnvSampler) {
      this._SpecularEnvSampler = this.makeCube({
        id: 'SpecularEnvSampler',
        getTextureForFace: (dir: number) => {
          const imageArray = [];
          for (let lod = 0; lod <= this.specularMipLevels - 1; lod++) {
            imageArray.push(loadImage(this.getTexUrl('specular', dir, lod)));
          }
          return imageArray;
        },
        parameters: {
          [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
          [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
          [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
          [GL.TEXTURE_MAG_FILTER]: GL.LINEAR
        }
      });
    }

    return this._SpecularEnvSampler;
  }

  getBrdfTexture(): Texture2D {
    if (!this._BrdfTexture) {
      this._BrdfTexture = new Texture2D(this.device, {
        id: 'brdfLUT',
        parameters: {
          [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
          [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
          [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
          [GL.TEXTURE_MAG_FILTER]: GL.LINEAR
        },
        // Texture2D accepts a promise that returns an image as data (Async Textures)
        data: loadImage(this.brdfLutUrl)
      });
    }

    return this._BrdfTexture;
  }
}
