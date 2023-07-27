const conceptDebuffToColor = {
  alpha: 'red',
  beta: 'yellow',
};

const conceptLocationMap = {
  north: [0, 10, 20, 30],
  middle: [2, 12, 22, 32],
  south: [4, 14, 24, 34],
};

const getConceptMap = (startLoc) => {
  // takes a concept location and returns an array containing pairs of [adjacentLocation, interceptLocation]
  const conceptMap = [];
  const expectedLocs = [
    ...conceptLocationMap.north,
    ...conceptLocationMap.middle,
    ...conceptLocationMap.south,
  ];
  const [n, e, s, w] = [startLoc - 2, startLoc + 10, startLoc + 2, startLoc - 10];
  if (expectedLocs.includes(n))
    conceptMap.push([n, n + 1]);
  if (expectedLocs.includes(e))
    conceptMap.push([e, e - 5]);
  if (expectedLocs.includes(s))
    conceptMap.push([s, s - 1]);
  if (expectedLocs.includes(w))
    conceptMap.push([w, w + 5]);
  return conceptMap;
};

Options.Triggers.push(
{
  id: 'AnabaseiosTheTwelfthCircleSavage-USER',
  zoneId: ZoneId.AnabaseiosTheTwelfthCircleSavage,
  config: [
    {
      id: 'classicalConceptsPairOrder',
      name: {
        en: 'Classical Concepts: Pairs Order (Left->Right)',
        de: 'Elementarschöpfung: Ordnen nach Paaren (Links->Rechts)',
        cn: '经典概念 索尼顺序（左->右）',
        ko: 'Classical Concepts: 도형 순서 (왼 -> 오)',
      },
      type: 'select',
      options: {
        en: {
          'X□○Δ (BPOG)': 'xsct',
          '○XΔ□ (Lines)': 'cxts',
          '○Δ□X (Rocketship)': 'ctsx',
          '○ΔX□ (Rainbow)': 'ctxs',
          'XΔ○□ (Bananas)': 'xtcs',
          'Just call shape and debuff': 'shapeAndDebuff',
        },
      },
      default: 'xtcs',
    },
  ],
  initData: () => {
    return {
    };
  },
  triggers: [
    {
      id: 'P12S Palladion White Flame Initial',
      type: 'StartsUsing',
      // 82F5 = Palladion cast
      // 8 seconds from Palladion starts casting to first White Flame damage
      // This is also an 8 second cast.
      // ~3 seconds after that for every potential White Flame
      netRegex: { id: '82F5', source: 'Athena', capture: false },
      // Don't collide with number callout.
      delaySeconds: 2,
      durationSeconds: (data) => {
        const delay = data.lcWhiteFlameDelay?.[0] ?? 1;
        // 8 seconds from cast start - 2 second delay already
        return (8 - 2) + 3 * (delay - 1) - 0.5;
      },
      response: (_data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          baitLaser: {
            en: 'Bait Laser',
            de: 'Laser Ködern',
            fr: 'Bait le laser',
            ja: 'レーザー誘導',
            cn: '引导激光',
            ko: '레이저 유도',
          },
          firstWhiteFlame: {
            en: '5/7 bait',
          },
        };
        // TODO: use `data.lcWhiteFlameDelay` to say things like "quick" or "delayed" or "very delayed".
        const infoText = output.firstWhiteFlame();
      //if (data.limitCutNumber === 5 || data.limitCutNumber === 7)
      //  return { alertText: output.baitLaser(), infoText: infoText };
        return { infoText: infoText };
      },
    },
    {
      id: 'P12S Palladion White Flame Followup',
      type: 'Ability',
      netRegex: { id: '82EF', source: 'Anthropos', capture: false },
      condition: (data) => data.phase === 'palladion',
      preRun: (data) => data.whiteFlameCounter++,
      durationSeconds: (data) => {
        const delay = data.lcWhiteFlameDelay?.[data.whiteFlameCounter] ?? 1;
        return 3 * delay - 0.5;
      },
      response: (data, _matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          baitLaser: {
            en: 'Bait Laser',
            de: 'Laser Ködern',
            fr: 'Bait le laser',
            ja: 'レーザー誘導',
            cn: '引导激光',
            ko: '레이저 유도',
          },
          secondWhiteFlame: {
            en: '6/8 bait',
          },
          thirdWhiteFlame: {
            en: '1/3 bait',
          },
          fourthWhiteFlame: {
            en: '2/4 bait',
          },
        };

        // TODO: use `data.lcWhiteFlameDelay` to say things like "quick" or "delayed" or "very delayed".

      //const baitLaser = output.baitLaser();

        if (data.whiteFlameCounter === 1) {
          const infoText = output.secondWhiteFlame();
        //if (data.limitCutNumber === 6 || data.limitCutNumber === 8)
        //  return { alertText: baitLaser, infoText: infoText };
          return { infoText: infoText };
        }
        if (data.whiteFlameCounter === 2) {
          const infoText = output.thirdWhiteFlame();
        //if (data.limitCutNumber === 1 || data.limitCutNumber === 3)
        //  return { alertText: baitLaser, infoText: infoText };
          return { infoText: infoText };
        }
        if (data.whiteFlameCounter === 3) {
          const infoText = output.fourthWhiteFlame();
        //if (data.limitCutNumber === 2 || data.limitCutNumber === 4)
        //  return { alertText: baitLaser, infoText: infoText };
          return { infoText: infoText };
        }
      },
    },
    {
      id: 'MY P12S Engravement 3 Towers',
      type: 'GainsEffect',
      netRegex: { effectId: 'DF[BC]' },
      condition: (data, _matches) => data.engravementCounter === 3,
      delaySeconds: 0.3,
      suppressSeconds: 9999,
      response: (_data, matches, output) => {
        output.responseOutputStrings = {
          lightDPS: {
            en: 'Light DPS soak towers',
          },
          darkDPS: {
            en: 'Dark DPS soak towers',
          },
        };

        if (matches.effectId === 'DFB') {
          return { infoText: output.darkDPS() };
        }
        else {
          return { infoText: output.lightDPS() };
        }
      },
    },
    {
      id: 'P12S Classical Concepts',
      type: 'StartsUsing',
      // 8331 = The Classical Concepts (6.7s cast)
      // 8336 = Panta Rhei (9.7s cast during classical2 that inverts shapes)
      netRegex: { id: ['8331', '8336'], source: 'Pallas Athena' },
      delaySeconds: (_data, matches) => {
        if (matches.id === '8331')
          // for Classical Concepts, 6.7 cast time + 1.8 for shape/debuff/headmarker data (some variability)
          return 8.5;
        return 0; // for Panta Rhei, fire immediately once cast starts
      },
      durationSeconds: (data, matches) => {
        if (data.phase === 'classical1')
          return 12; // keep active until shapes tether
        if (matches.id === '8331')
          return 7; // for classical2 initial, display initially to allow player to find (stand in) initial position
        return 9.7; // for Panta Rhei, display until shape inversion completes
      },
      response: (data, matches, output) => {
        // cactbot-builtin-response
        output.responseOutputStrings = {
          classic1: {
            en: '${column}, ${row} => ${intercept}',
            de: '${column}, ${row} => ${intercept}',
            cn: '${column}, ${row} => ${intercept}',
            ko: '${column}, ${row} => ${intercept}',
          },
          classic2initial: {
            en: 'Initial: ${column}, ${row} => ${intercept}',
            de: 'Initial: ${column}, ${row} => ${intercept}',
            cn: '先去 ${column}, ${row} => ${intercept}',
            ko: '시작: ${column}, ${row} => ${intercept}',
          },
          classic2actual: {
            en: 'Actual: ${column}, ${row} => ${intercept}',
            de: 'Tatsächlich: ${column}, ${row} => ${intercept}',
            cn: '去 ${column}, ${row} => ${intercept}',
            ko: '실제: ${column}, ${row} => ${intercept}',
          },
          shapeAndDebuff: {
            en: '${shape}, ${debuff}',
            de: '${shape}, ${debuff}',
            fr: '${shape}, ${debuff}',
            ja: '${shape}, ${debuff}',
            cn: '${shape}, ${debuff}',
            ko: '${shape}, ${debuff}',
          },
          outsideWest: {
            en: 'Outside West',
            de: 'Außerhalb Westen',
            cn: '第1列 (左西 外侧)',
            ko: '1열 (서쪽 바깥)',
          },
          insideWest: {
            en: 'Inside West',
            de: 'Innen Westen',
            cn: '第2列 (左西 内侧)',
            ko: '2열 (서쪽 안)',
          },
          insideEast: {
            en: 'Inside East',
            de: 'Innen Osten',
            cn: '第3列 (右东 内侧)',
            ko: '3열 (동쪽 안)',
          },
          outsideEast: {
            en: 'Outside East',
            de: 'Außerhalb Osten',
            cn: '第4列 (右东 外侧)',
            ko: '4열 (동쪽 바깥)',
          },
          northRow: {
            en: 'North Blue',
            de: 'Norden Blau',
            cn: '第1个蓝方块',
            ko: '위쪽 파란색',
          },
          middleRow: {
            en: 'Middle Blue',
            de: 'Mitte Blau',
            cn: '第2个蓝方块',
            ko: '가운데 파란색',
          },
          southRow: {
            en: 'South Blue',
            de: 'Süden Blau',
            cn: '第3个蓝方块',
            ko: '아래쪽 파란색',
          },
          leanNorth: {
            en: 'Lean North',
            de: 'Nördlich halten',
            cn: '靠上(北)',
            ko: '위쪽',
          },
          leanEast: {
            en: 'Lean East',
            de: 'Östlich halten',
            cn: '靠右(东)',
            ko: '오른쪽',
          },
          leanSouth: {
            en: 'Lean South',
            de: 'Südlich halten',
            cn: '靠下(南)',
            ko: '아래쪽',
          },
          leanWest: {
            en: 'Lean West',
            de: 'Westlich halten',
            cn: '靠左(西)',
            ko: '왼쪽',
          },
          circle: {
            en: 'Red Circle',
            de: 'Roter Kreis',
            fr: 'Cercle rouge',
            ja: '赤まる',
            cn: '红圆圈',
            ko: '빨강 동그라미',
          },
          triangle: {
            en: 'Green Triangle',
            de: 'Grünes Dreieck',
            fr: 'Triangle vert',
            ja: '緑さんかく',
            cn: '绿三角',
            ko: '초록 삼각',
          },
          square: {
            en: 'Purple Square',
            de: 'Lila Viereck',
            fr: 'Carré violet',
            ja: '紫しかく',
            cn: '紫方块',
            ko: '보라 사각',
          },
          cross: {
            en: 'Blue X',
            de: 'Blaues X',
            fr: 'Croix bleue',
            ja: '青バツ',
            cn: '蓝 X',
            ko: '파랑 X',
          },
          alpha: {
            en: 'Alpha',
            de: 'Alpha',
            fr: 'Alpha',
            ja: 'アルファ',
            cn: '阿尔法',
            ko: '알파',
          },
          beta: {
            en: 'Beta',
            de: 'Beta',
            fr: 'Beta',
            ja: 'ベータ',
            cn: '贝塔',
            ko: '베타',
          },
        };

        if (
          Object.keys(data.conceptData).length !== 12 ||
          data.conceptDebuff === undefined ||
          data.conceptPair === undefined
        )
          return;

        if (data.triggerSetConfig.classicalConceptsPairOrder === 'shapeAndDebuff') {
          if (matches.id === '8336') // prevent going off again on Panta Rhei
            return;
          const myShape = data.conceptPair;
          const myDebuff = data.conceptDebuff;
          const outputStr = output.shapeAndDebuff({
            shape: output[myShape](),
            debuff: output[myDebuff](),
          });
          return { alertText: outputStr };
        }

        let myColumn;
        let myRow;
        let myInterceptOutput;

        if (matches.id === '8331') {
          // for classic1 and classic2, find the (initial) position for the player to intercept
          const columnOrderFromConfig = {
            xsct: ['cross', 'square', 'circle', 'triangle'],
            cxts: ['circle', 'cross', 'triangle', 'square'],
            ctsx: ['circle', 'triangle', 'square', 'cross'],
            ctxs: ['circle', 'triangle', 'cross', 'square'],
            xtcs: ['cross', 'triangle', 'circle', 'square'],
          };
          const columnOrder =
            columnOrderFromConfig[data.triggerSetConfig.classicalConceptsPairOrder];
          if (columnOrder?.length !== 4)
            return;

          myColumn = columnOrder.indexOf(data.conceptPair);
          const myColumnLocations = [
            conceptLocationMap.north[myColumn],
            conceptLocationMap.middle[myColumn],
            conceptLocationMap.south[myColumn],
          ];
          const [north, middle, south] = myColumnLocations;
          if (north === undefined || middle === undefined || south === undefined)
            return;

          let myColumnBlueLocation;
          if (data.conceptData[north] === 'blue')
            myColumnBlueLocation = north;
          else
            myColumnBlueLocation = data.conceptData[middle] === 'blue' ? middle : south;
          myRow = myColumnLocations.indexOf(myColumnBlueLocation);

          const conceptMap = getConceptMap(myColumnBlueLocation);
          const myShapeColor = conceptDebuffToColor[data.conceptDebuff];

          const possibleLocations = [];
          const possibleIntercepts = [];
          conceptMap.forEach((adjacentPair) => {
            const [location, intercept] = adjacentPair;
            if (location !== undefined && intercept !== undefined) {
              const adjacentColor = data.conceptData[location];
              if (adjacentColor === myShapeColor) {
                possibleLocations.push(location);
                possibleIntercepts.push(intercept);
              }
            }
          });

          let myIntercept; // don't set this initially in case there's something wrong with possibleLocations
          if (possibleLocations.length === 1) {
            // only one possible adjacent shape to intercept; we're done
            myIntercept = possibleIntercepts[0];
          } else if (possibleLocations.length === 2) {
            // two adjacent shapes that match player's debuff (does happen)
            // the one that is NOT adjacent to a different blue is the correct shape.
            // NOTE: There is a theoretical arrangement where both possibles are adjacent to another blue,
            // but this has never been observed in-game, and it generates two valid solution sets.
            // Since there is no single solution, we should not generate an output for it.
            const possible1 = possibleLocations[0];
            myIntercept = possibleIntercepts[0];
            if (possible1 === undefined)
              return;
            const possible1AdjacentsMap = getConceptMap(possible1);
            for (const [possibleAdjacentLocation] of possible1AdjacentsMap) {
              if (possibleAdjacentLocation === undefined)
                continue;
              const possibleAdjacentColor = data.conceptData[possibleAdjacentLocation];
              if (
                possibleAdjacentColor === 'blue' &&
                possibleAdjacentLocation !== myColumnBlueLocation
              ) {
                // there's an adjacent blue (not the one the player is responsible for), so possibleLocations[0] is eliminated
                myIntercept = possibleIntercepts[1];
                break;
              }
            }
          }

          if (myIntercept === undefined)
            return;

          const interceptDelta = myIntercept - myColumnBlueLocation;
          if (interceptDelta === -1)
            myInterceptOutput = 'leanNorth';
          else if (interceptDelta === 5)
            myInterceptOutput = 'leanEast';
          else if (interceptDelta === 1)
            myInterceptOutput = 'leanSouth';
          // else: interceptDelta === -5
          else
            myInterceptOutput = 'leanWest';

          if (data.phase === 'classical2') {
            data.classical2InitialColumn = myColumn;
            data.classical2InitialRow = myRow;
            data.classical2Intercept = myInterceptOutput;
          }
        } else {
          // for Panta Rhei, get myColumn, myRow, and myInterceptOutput from data{} and invert them
          if (data.classical2InitialColumn !== undefined)
            myColumn = 3 - data.classical2InitialColumn;
          if (data.classical2InitialRow !== undefined)
            myRow = 2 - data.classical2InitialRow;
          if (data.classical2Intercept !== undefined) {
            const interceptOutputInvertMap = {
              leanNorth: 'leanSouth',
              leanSouth: 'leanNorth',
              leanEast: 'leanWest',
              leanWest: 'leanEast',
            };
            myInterceptOutput = interceptOutputInvertMap[data.classical2Intercept];
          }
        }

        if (myColumn === undefined || myRow === undefined || myInterceptOutput === undefined)
          return;

        const columnOutput = ['outsideWest', 'insideWest', 'insideEast', 'outsideEast'][myColumn];
        const rowOutput = ['northRow', 'middleRow', 'southRow'][myRow];
        if (columnOutput === undefined || rowOutput === undefined)
          return;

        let outputStr;
        if (data.phase === 'classical1') {
          outputStr = output.classic1({
            column: output[columnOutput](),
            row: output[rowOutput](),
            intercept: output[myInterceptOutput](),
          });
          return { alertText: outputStr };
        }
        if (matches.id === '8331') { // classic2 initial
          outputStr = output.classic2initial({
            column: output[columnOutput](),
            row: output[rowOutput](),
            intercept: output[myInterceptOutput](),
          });
          return { infoText: outputStr };
        }
        outputStr = output.classic2actual({
          column: output[columnOutput](),
          row: output[rowOutput](),
          intercept: output[myInterceptOutput](),
        });
        return { alertText: outputStr };
      },
      run: (data) => {
        if (data.phase === 'classical1') {
          delete data.conceptPair;
          data.conceptData = {};
        }
      },
    },],
  }
);