import React from "react";
import paper from "paper";
import doublependulum from "./doublependulum";

function DoublePendulumDrawer(props) {
  React.useEffect(() => {
    setupScene();
  }, []);

  let canvas = React.useRef();
  let anchor;
  let pendula = props.pendula || [
    {
      dp: new doublependulum(Math.PI / 2, Math.PI / 1, 1, 1),
    },
  ];
  let segmentsDrawn = 0;

  function setupScene() {
    paper.setup(canvas.current);
    paper.view.onFrame = onFrame;
    anchor = paper.view.center;

    pendula.forEach((pendulum, index) => {
      let { dp } = pendulum;
      let { r1, r2 } = dp.convertConstants(100);
      let { x1, y1, x2, y2 } = dp.convertVars(100);

      // Add to canvas before p1/p2 for correct z index
      let rods = new paper.Path({ strokeColor: "#f2aa4c", strokeWidth: 2 });
      let trace = new paper.Path({ strokeColor: "#f2aa4c" });

      let p1 = new paper.Path.Circle(anchor.x + x1, anchor.y + y1, r1);
      p1.fillColor = "#f2aa4c";

      let p2 = new paper.Path.Circle(anchor.x + x2, anchor.y + y2, r2);
      p2.fillColor = "#f2aa4c";

      rods.add(anchor, p1.position, p2.position);
      trace.add(p2.position);

      pendulum.p1 = p1;
      pendulum.p2 = p2;
      pendulum.rods = rods;
      pendulum.trace = trace;
    });

    let pivot = new paper.Path.Circle(anchor, 5);
    pivot.fillColor = "white";
  }

  function onFrame(event) {
    let h = 0.005;
    let num_steps = Math.floor(event.delta / h);
    for (let i = 0; i < num_steps; i++) {
      pendula.forEach((pendulum) => {
        pendulum.dp.step(h);
      });
    }
    pendula.forEach((pendulum) => {
      let { dp } = pendulum;
      let { x1, y1, x2, y2 } = dp.convertVars(100);
      pendulum.p1.position = [anchor.x + x1, anchor.y + y1];
      pendulum.p2.position = [anchor.x + x2, anchor.y + y2];
      pendulum.rods.removeSegments();
      pendulum.rods.add(anchor, pendulum.p1.position, pendulum.p2.position);
      if (segmentsDrawn < 900) {
        pendulum.trace.add(pendulum.p2.position);
        segmentsDrawn++;
      } else {
        pendulum.trace.removeSegment(0);
        pendulum.trace.add(pendulum.p2.position);
      }
    });
  }

  return <canvas ref={canvas}></canvas>;
}

export default DoublePendulumDrawer;
