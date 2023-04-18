window.addEventListener('load', makeCoordinates)
function makeCoordinates() {
  coordsPixels('#coords')

  const sc = d3.scaleLinear().domain([-3, 3]).range([0, 300])
  coordsDomain('#coords2', sc)
}

function coordsPixels(selector) {
  const txt = d3.select(selector).append('text') //<1>
  const svg = d3
    .select(selector)
    .attr('cursor', 'crosshair') //<2>
    .on('mousemove', function () {
      const pt = d3.mouse(svg.node()) //<3>
      txt
        .attr('x', 18 + pt[0])
        .attr('y', 6 + pt[1]) //<4>
        .text('' + pt[0] + ',' + pt[1])
    })
}

function coordsDomain(selector, scale) {
  const txt = d3
    .select(selector)
    .append('text') // <1>
    .attr('x', 20)
    .attr('y', 20)
  const fmt = d3.format('.2f') // <2>
  const svg = d3
    .select(selector)
    .attr('cursor', 'crosshair')
    .on('mousemove', function () {
      const pt = d3.mouse(svg.node()).map(scale.invert).map(fmt)
      txt.text(pt[0] + ',' + pt[1]) // <3>
    })
}

window.addEventListener('load', makeBrush)
function makeBrush() {
  d3.csv('dense.csv').then(function (data) {
    //<1>
    const svg1 = d3.select('#brush1') //<2>
    const svg2 = d3.select('#brush2')

    const sc1 = d3
      .scaleLinear()
      .domain([0, 10, 50]) //<3>
      .range(['lime', 'yellow', 'red'])
    const sc2 = d3.scaleLinear().domain([0, 10, 50]).range(['lime', 'yellow', 'blue'])

    const cs1 = drawCircles(
      svg1,
      data,
      (d) => d['A'],
      (d) => d['B'],
      sc1
    ) //<4>
    const cs2 = drawCircles(
      svg2,
      data,
      (d) => d['A'],
      (d) => d['C'],
      sc2
    )

    svg1.call(installHandlers, data, cs1, cs2, sc1, sc2) //<5>
  })
}

function drawCircles(svg, data, accX, accY, sc) {
  const color = sc(Infinity) //<6>
  return svg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', 5)
    .attr('cx', accX)
    .attr('cy', accY)
    .attr('fill', color)
    .attr('fill-opacity', 0.4)
}

function installHandlers(svg, data, cs1, cs2, sc1, sc2) {
  svg
    .attr('cursor', 'crosshair')
    .on('mousemove', function () {
      const pt = d3.mouse(svg.node())

      cs1.attr('fill', function (d, i) {
        //<7>
        const dx = pt[0] - d3.select(this).attr('cx')
        const dy = pt[1] - d3.select(this).attr('cy')
        const r = Math.hypot(dx, dy)

        data[i]['r'] = r //<8>
        return sc1(r)
      }) //<9>

      cs2.attr('fill', (d, i) => sc2(data[i]['r']))
    }) //<10>

    .on('mouseleave', function () {
      cs1.attr('fill', sc1(Infinity)) //<11>
      cs2.attr('fill', sc2(Infinity))
    })
}
function installHandlers2(svg, data, cs1, cs2, sc1, sc2) {
  const cursor = svg
    .append('circle')
    .attr('r', 50) //<1>
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 10)
    .attr('stroke-opacity', 0.1)
    .attr('visibility', 'hidden') //<2>

  const hotzone = svg
    .append('rect')
    .attr('cursor', 'none') //<3>
    .attr('x', 50)
    .attr('y', 50)
    .attr('width', 200)
    .attr('height', 200)
    .attr('visibility', 'hidden') //<4>
    .attr('pointer-events', 'all')

    .on('mouseenter', function () {
      //<5>
      cursor.attr('visibility', 'visible')
    })

    .on('mousemove', function () {
      //<6>
      const pt = d3.mouse(svg.node())
      cursor.attr('cx', pt[0]).attr('cy', pt[1])

      cs1.attr('fill', function (d, i) {
        const dx = pt[0] - d3.select(this).attr('cx')
        const dy = pt[1] - d3.select(this).attr('cy')
        const r = Math.hypot(dx, dy)

        data[i]['r'] = r
        return sc1(r)
      })

      cs2.attr('fill', (d, i) => sc2(data[i]['r']))
    })

    .on('mouseleave', function () {
      cursor.attr('visibility', 'hidden')
      cs1.attr('fill', sc1(Infinity))
      cs2.attr('fill', sc2(Infinity))
    })
}

window.addEventListener('load', makeDragDrop)
function makeDragDrop() {
  let widget = undefined,
    color = undefined

  const drag = d3
    .drag() //<1>
    .on('start', function () {
      //<2>
      color = d3.select(this).attr('fill')
      widget = d3.select(this).attr('fill', 'lime')
    })
    .on('drag', function () {
      //<3>
      const pt = d3.mouse(d3.select(this).node())
      widget.attr('cx', pt[0]).attr('cy', pt[1])
    })
    .on('end', function () {
      //<4>
      widget.attr('fill', color)
      widget = undefined
    })

  drag(d3.select('#dragdrop').selectAll('circle')) //<5>
}

window.addEventListener('load', makeDragDropExplicit)

function makeDragDropExplicit() {
  let widget = undefined,
    color = undefined

  d3.select('#dragdrop2')
    .selectAll('circle')
    .on('mousedown', function () {
      color = d3.select(this).attr('fill')
      widget = d3.select(this).attr('fill', 'lime')
    })

  d3.select('#dragdrop2')
    .on('mouseup', function () {
      if (!widget) {
        return
      }
      widget.attr('fill', color)
      widget = undefined
    })
    .on('mousemove', function () {
      if (!widget) {
        return
      }
      d3.event.preventDefault()
      const pt = d3.mouse(d3.select(this).node())
      widget.attr('cx', pt[0]).attr('cy', pt[1])
    })
}

window.addEventListener('load', makeStagger)
function makeStagger() {
  const ds1 = [2, 1, 3, 5, 7, 8, 9, 9, 9, 8, 7, 5, 3, 1, 2] //<1>
  const ds2 = [8, 9, 8, 7, 5, 3, 2, 1, 2, 3, 5, 7, 8, 9, 8]
  const n = ds1.length,
    mx = d3.max(d3.merge([ds1, ds2])) //<2>

  const svg = d3.select('#stagger')

  const scX = d3.scaleLinear().domain([0, n]).range([50, 540]) //<3>
  const scY = d3.scaleLinear().domain([0, mx]).range([250, 50])

  svg
    .selectAll('line')
    .data(ds1)
    .enter()
    .append('line') //<4>
    .attr('stroke', 'red')
    .attr('stroke-width', 20)
    .attr('x1', (d, i) => scX(i))
    .attr('y1', scY(0))
    .attr('x2', (d, i) => scX(i))
    .attr('y2', (d) => scY(d))

  svg.on('click', function () {
    //<5>
    ;[ds1, ds2] = [ds2, ds1] //<6>

    svg
      .selectAll('line')
      .data(ds1) //<7>
      .transition()
      .duration(1000)
      .delay((d, i) => 200 * i) //<8>
      .attr('y2', (d) => scY(d)) //<9>
  })
}

window.addEventListener('load', makeLissajous)
function makeLissajous() {
  const svg = d3.select('#lissajous')

  const a = 3.2,
    b = 5.9 // Lissajous frequencies

  let crrX = 150 + 100,
    crrY = 150 + 0
  let prvX = crrX,
    prvY = crrY

  const timer = d3.timer(function (t) {
    let phi
    const omega = (2 * Math.PI) / 10000 // 10 seconds per period
    phi = omega * t

    crrX = 150 + 100 * Math.cos(a * phi)
    crrY = 150 + 100 * Math.sin(b * phi)

    svg
      .selectAll('line')
      .each(function () {
        this.bogus_opacity *= 0.99
      })
      .attr('stroke-opacity', function () {
        return this.bogus_opacity
      })
      .filter(function () {
        return this.bogus_opacity < 0.05
      })
      .remove()

    svg
      .append('line')
      .each(function () {
        this.bogus_opacity = 1.0
      })
      .attr('x1', prvX)
      .attr('y1', prvY)
      .attr('x2', crrX)
      .attr('y2', crrY)
      .attr('stroke', 'green')
      .attr('stroke-width', 2)

    prvX = crrX
    prvY = crrY

    if (t > 120e3) {
      timer.stop()
    } // after 120 seconds
  })
}

window.addEventListener('load', makeVoters)
function makeVoters() {
  const n = 50,
    w = 300 / n,
    dt = 3000,
    svg = d3.select('#voters')

  const data = d3
    .range(n * n) //<1>
    .map((d) => {
      return { x: d % n, y: (d / n) | 0, val: Math.random() }
    })

  const sc = d3
    .scaleQuantize() //<2>
    .range(['white', 'red', 'black'])

  svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect') //<3>
    .attr('x', (d) => w * d.x)
    .attr('y', (d) => w * d.y)
    .attr('width', w - 1)
    .attr('height', w - 1)
    .attr('fill', (d) => sc(d.val))

  function update() {
    //<4>
    const nbs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]
    return d3.shuffle(d3.range(n * n)).map((i) => {
      const nb = nbs[(nbs.length * Math.random()) | 0]
      const x = (data[i].x + nb[0] + n) % n
      const y = (data[i].y + nb[1] + n) % n
      data[i].val = data[y * n + x].val
    })
  }

  d3.interval(function () {
    //<5>
    update()
    svg
      .selectAll('rect')
      .data(data)
      .transition()
      .duration(dt)
      .delay((d, i) => (i * 0.25 * dt) / (n * n))
      .attr('fill', (d) => sc(d.val))
  }, dt)
}
