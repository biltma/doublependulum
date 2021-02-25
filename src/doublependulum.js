class doublependulum {
  constructor(
    t1i = Math.PI / 2,
    t2i = Math.PI / 2,
    m1 = 1,
    m2 = 1,
    l1 = 1,
    l2 = 1,
    r1 = 0.1,
    r2 = 0.1,
    g = 9.81
  ) {
    this.m1 = m1;
    this.m2 = m2;
    this.l1 = l1;
    this.l2 = l2;
    this.r1 = r1;
    this.r2 = r2;
    this.g = g;
    this.t1 = t1i;
    this.t2 = t2i;
    this.t1dot = 0;
    this.t2dot = 0;
  }

  step = h => {
    let { t1, t2, t1dot, t2dot } = this.vars;
    let a0 = h * this._calct1ddot(t1dot, t2dot);
    let b0 = h * this._calct2ddot(t1dot, t2dot);
    let a1 = h * this._calct1ddot(t1dot + a0 / 2, t2dot + b0 / 2);
    let b1 = h * this._calct2ddot(t1dot + a0 / 2, t2dot + b0 / 2);
    let a2 = h * this._calct1ddot(t1dot + a1 / 2, t2dot + b1 / 2);
    let b2 = h * this._calct2ddot(t1dot + a1 / 2, t2dot + b1 / 2);
    let a3 = h * this._calct1ddot(t1dot + a2, t2dot + b2);
    let b3 = h * this._calct2ddot(t1dot + a2, t2dot + b2);

    this.t1dot = t1dot + (a0 + 2 * a1 + 2 * a2 + a3) / 6;
    this.t2dot = t2dot + (b0 + 2 * b1 + 2 * b2 + b3) / 6;
    this.t1 = t1 + this.t1dot * h + (a0 * Math.pow(h, 2)) / 2;
    this.t2 = t2 + this.t2dot * h + (b0 * Math.pow(h, 2)) / 2;
  };

  KE = () => {
    let { m1, m2, l1, l2 } = this.constants;
    let { t1, t2, t1dot, t2dot } = this.vars;
    let v1 = Math.pow(l1 * t1dot, 2);
    let v2 =
      Math.pow(l1 * t1dot, 2) +
      Math.pow(l2 * t2dot, 2) +
      2 * l1 * l2 * t1dot * t2dot * Math.cos(t1 - t2);
    return (m1 * v1 + m2 * v2) / 2;
  };

  PE = () => {
    let { m1, m2, l1, l2, g } = this.constants;
    let { t1, t2 } = this.vars;
    let h1 = l1 * (1 - Math.cos(t1));
    let h2 = l1 * (1 - Math.cos(t1)) + l2 * (1 - Math.cos(t2));
    return m1 * g * h1 + m2 * g * h2;
  };

  get constants() {
    return {
      m1: this.m1,
      m2: this.m2,
      l1: this.l1,
      l2: this.l2,
      r1: this.r1,
      r2: this.r2,
      g: this.g
    };
  }

  get vars() {
    let { l1, l2 } = this.constants;
    return {
      t1: this.t1,
      t2: this.t2,
      t1dot: this.t1dot,
      t2dot: this.t2dot,
      x1: l1 * Math.sin(this.t1dot),
      y1: l1 * Math.cos(this.t1dot),
      x2: l1 * Math.sin(this.t1dot) + l2 * Math.sin(this.t2dot),
      y2: l1 * Math.cos(this.t1dot) + l2 * Math.cos(this.t2dot)
    };
  }

  convertConstants(u2m = 1, u2kg = 1) {
    let { m1, m2, l1, l2, r1, r2, g } = this.constants;
    return {
      m1: m1 * u2kg,
      m2: m2 * u2kg,
      l1: l1 * u2m,
      l2: l2 * u2m,
      r1: r1 * u2m,
      r2: r2 * u2m,
      g: g * u2m
    };
  }

  convertVars(u2m = 1) {
    let { l1, l2 } = this.constants;
    let { t1, t2, t1dot, t2dot } = this.vars;
    return {
      t1,
      t2,
      t1dot,
      t2dot,
      x1: l1 * Math.sin(t1) * u2m,
      y1: l1 * Math.cos(t1) * u2m,
      x2: (l1 * Math.sin(t1) + l2 * Math.sin(t2)) * u2m,
      y2: (l1 * Math.cos(t1) + l2 * Math.cos(t2)) * u2m
    };
  }

  _calct1ddot(t1dot, t2dot) {
    let { m1, m2, l1, l2, g } = this.constants;
    let { t1, t2 } = this.vars;
    return (
      -(
        (l1 * m2 * Math.sin(2 * t1 - 2 * t2) * Math.pow(t1dot, 2)) / 2 +
        l2 * m2 * Math.sin(t1 - t2) * Math.pow(t2dot, 2) +
        (g * m2 * Math.sin(t1 - 2 * t2)) / 2 +
        g * m1 * Math.sin(t1) +
        (g * m2 * Math.sin(t1)) / 2
      ) /
      (l1 * (m1 + m2 / 2 - (m2 * Math.cos(2 * t1 - 2 * t2)) / 2))
    );
  }

  _calct2ddot(t1dot, t2dot) {
    let { m1, m2, l1, l2, g } = this.constants;
    let { t1, t2 } = this.vars;
    return (
      (g * m1 * Math.sin(2 * t1 - t2) -
        g * m2 * Math.sin(t2) -
        g * m1 * Math.sin(t2) +
        g * m2 * Math.sin(2 * t1 - t2) +
        2 * l1 * m1 * Math.pow(t1dot, 2) * Math.sin(t1 - t2) +
        2 * l1 * m2 * Math.pow(t1dot, 2) * Math.sin(t1 - t2) +
        l2 * m2 * Math.pow(t2dot, 2) * Math.sin(2 * t1 - 2 * t2)) /
      (2 * l2 * m1 + l2 * m2 - l2 * m2 * Math.cos(2 * t1 - 2 * t2))
    );
  }
}

export default doublependulum;
