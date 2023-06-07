import React, {FC, useEffect, useRef, useState, useCallback} from 'react'; // eslint-disable-line
import {isBrowser} from '@probe.gl/env';
import {luma, setPathPrefix} from '@luma.gl/api';
import {AnimationLoopTemplate, AnimationLoop, makeAnimationLoop} from '@luma.gl/engine';

import StatsWidget from '@probe.gl/stats-widget';
// import {VRDisplay} from '@luma.gl/experimental';
import {InfoPanel} from '../../react-ocular';
import {useStore} from '../store/device-store';

const GITHUB_TREE = 'https://github.com/visgl/luma.gl/tree/8.5-release';

// WORKAROUND FOR luma.gl VRDisplay
// if (!globalThis.navigator) {// eslint-disable-line
//   globalThis.navigator = {};// eslint-disable-line
// }

if (typeof window !== 'undefined') {
  window.website = true;
}

const STYLES = {
  EXAMPLE_NOT_SUPPPORTED: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }
};

const STAT_STYLES = {
  position: 'fixed',
  fontSize: '12px',
  zIndex: 10000,
  color: '#fff',
  background: '#000',
  padding: '8px',
  opacity: 0.8
};

const DEFAULT_ALT_TEXT = 'THIS EXAMPLE IS NOT SUPPORTED';

type LumaExampleProps = {
  AnimationLoopTemplate: typeof AnimationLoopTemplate;
  exampleConfig: unknown;
  name: string;
  style?: CSSStyleDeclaration;
  container?: string;
};

const defaultProps = {
  name: 'luma-example'
};

const state = {
  supported: true,
  error: null
};

// const FancyDiv = React.forwardRef<HTMLElement>((props, ref) => (
//   <div ref={ref} className="FancyDiv"></div>
// ));

let created = false;

export const LumaExample: FC<LumaExampleProps> = props => {
  let containerName = 'ssr';

  if (!isBrowser()) {
    return <canvas />;
  }

  let animationLoop: AnimationLoop | null = null;
  const callbackRef = useCallback((canvas: HTMLCanvasElement) => {
    console.error(`rendering luma example ${canvas.id}`); // , ref.current);
    if (created) {
      return;
    }
    created = true;

    if (canvas) {
      const device = luma.createDevice({type, canvas});
      device.then(_device => {
        const canvas = _device.canvasContext?.htmlCanvas;
        if (canvas) {
          canvas.style.width = '100vw';
        }
      });
      let animationLoop: AnimationLoop | null = null;

      animationLoop = makeAnimationLoop(props.AnimationLoopTemplate, {
        device,
        autoResizeViewport: true,
        autoResizeDrawingBuffer: true
      });

      // Start the actual example
      animationLoop?.start();

      // Ensure the example can find its images
      const RAW_GITHUB = 'https://raw.githubusercontent.com/visgl/luma.gl/master';
      // const {exampleConfig} = this.props;
      if (props.name) {
        setPathPrefix(`${RAW_GITHUB}/examples/getting-started/${props.name}/`);
      } else {
        setPathPrefix(`${RAW_GITHUB}/website/static/images/`);
      }
    } else {
      console.error(`unmounting example ${props.name}`); // , ref.current);
      if (!created) {
        return;
      }
      created = false;
      animationLoop?.stop();
      animationLoop?.destroy();
      // device.destroy();
    }
  }, []);

  const type = useStore(store => store.deviceType);
  containerName = props.container || `luma-example-container-${type}`;

  /*
  useEffect(() => {
    if (created) {
      return;
    }

    const canvas = canvasRef.current!;
    if (!canvas) {
      return;
    }

    console.error(`creating device in canvas ${canvasRef.current}`); // , ref.current);

    created = true;

    const device = luma.createDevice({type, canvas});
    device.then(_device => {
      const canvas = _device.canvasContext?.htmlCanvas;
      if (canvas) {
        canvas.style.width = '100vw';
      }
    });
    let animationLoop: AnimationLoop | null = null;

    animationLoop = makeAnimationLoop(props.AnimationLoopTemplate, {device});

    // Start the actual example
    animationLoop?.start();

    // Ensure the example can find its images
    const RAW_GITHUB = 'https://raw.githubusercontent.com/visgl/luma.gl/master';
    // const {exampleConfig} = this.props;
    if (props.name) {
      setPathPrefix(`${RAW_GITHUB}/examples/getting-started/${props.name}/`);
    } else {
      setPathPrefix(`${RAW_GITHUB}/website/static/images/`);
    }

    return function unmount() {
      console.error(`unmounting device ` + containerName); // , ref.current);
      if(created) {
        return;
      }
      created = false;

      animationLoop?.stop();
      animationLoop?.destroy();
      // device.destroy();
    }
  }, [canvasRef]);
  */

  return <canvas ref={callbackRef} />;
};

/*

    // const {showStats} = this.props;

    // this.animationLoop._setDisplay(new VRDisplay());


    // try {
    //   if (this.animationLoop?.demoNotSupported) {
    //     this.setState({supported: false});

    //   }
    //   this.setState({error: null});
    // } catch (error) {
    //   this.setState({error: this.state.error || error});
    // }

    // animationLoop.stats.reset();

    // if (showStats) {
    //   this._showStats(this.animationLoop);
    // }



    // const {exampleConfig: {title, path} = {}, panel = true, stats} = this.props;

    // if (!this.state.supported) {
    //   const altText = this.animationLoop.getAltText ? this.animationLoop.getAltText() : DEFAULT_ALT_TEXT;
    //   return (
    //     <div style={STYLES.EXAMPLE_NOT_SUPPPORTED}>
    //       <h2> {altText} </h2>
    //     </div>
    //   );
    // }

    // HTML is stored on the app
    // const controls = 
    //   props.AnimationLoopTemplate.info ||
    //   props.AnimationLoopTemplate.getInfo?.() ||
    //   (animationLoop.getInfo?.());

  //   return (
  //     <div>
  //       {
  //         stats ?
  //         <div ref="stats" className="stats" style={STAT_STYLES}>
  //           <div ref="renderStats" className="renderStats"/>
  //           <div ref="memStats" className="memStats"/>
  //         </div> : null
  //       }
  //       <canvas
  //         id="example-canvas"
  //         style={{width: 800, height: 600}}
  //       />
  //       {panel && (
  //         <InfoPanel title={title} sourceLink={`${GITHUB_TREE}/${path}`}>
  //           <div dangerouslySetInnerHTML={{__html: controls}} />
  //           {
  //             this.state.error
  //               ? (<div> <b style={{color: 'red', overflowWrap: 'break-word', width: 200}}> This sample failed to render: <br /> {this.state.error.message} </b></div>)
  //               : (<></>)
  //           }
  //         </InfoPanel>
  //       )}
  //     </div>
  //   );
  // }

/*
_showStats(animationLoop) {
  const timeWidget = new StatsWidget(animationLoop.stats, {
    container: this.refs.renderStats,
    title: 'Render Time',
    css: {
      header: {
        fontWeight: 'bold'
      }
    },
    framesPerUpdate: 60,
    formatters: {
      'CPU Time': 'averageTime',
      'GPU Time': 'averageTime',
      'Frame Rate': 'fps'
    },
    resetOnUpdate: {
      'CPU Time': true,
      'GPU Time': true,
      'Frame Rate': true
    }
  });

  luma.stats.get('Memory Usage').reset();
  const memWidget = new StatsWidget(luma.stats.get('Memory Usage'), {
    container: this.refs.memStats,
    css: {
      header: {
        fontWeight: 'bold'
      }
    },
    framesPerUpdate: 60,
    formatters: {
      'GPU Memory': 'memory',
      'Buffer Memory': 'memory',
      'Renderbuffer Memory': 'memory',
      'Texture Memory': 'memory'
    }
  });

  const updateStats = () => {
    timeWidget.update();
    memWidget.update();
    this.animationFrame = window.requestAnimationFrame(updateStats);
  };

  this.animationFrame = window.requestAnimationFrame(updateStats);
}

_stopStats() {
  window.cancelAnimationFrame(this.animationFrame);
}
*/
