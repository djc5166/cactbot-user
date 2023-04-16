const waveCannonL = [
    'name1',
    'name2',
    'name3',
    'name4'
];

const waveCannonR = [
    'name5',
    'name6',
    'name7',
    'name8'
];

const sigmaBaitTargets = [
    'name1',
    'name2',
    'name3',
    'name4',
    'name5',
    'name6',
    'name7',
    'name8'
];

const markOrder = {
    "cross": 1,
    "triangle": 2,
    "circle": 3,
    "square": 4,
};

// Due to changes introduced in patch 5.2, overhead markers now have a random offset
// added to their ID. This offset currently appears to be set per instance, so
// we can determine what it is from the first overhead marker we see.
const headmarkers = {
  // vfx/lockon/eff/lockon5_t0h.avfx
  spread: '0017',
  // vfx/lockon/eff/tank_lockonae_5m_5s_01k1.avfx
  buster: '0157',
  // vfx/lockon/eff/z3oz_firechain_01c.avfx through 04c
  firechainCircle: '01A0',
  firechainTriangle: '01A1',
  firechainSquare: '01A2',
  firechainX: '01A3',
  // vfx/lockon/eff/com_share2i.avfx
  stack: '0064',
  // vfx/lockon/eff/all_at8s_0v.avfx
  meteor: '015A',
};

const firstMarker = parseInt('0017', 16);

function getHeadmarkerId( data, matches )
{
    if (data.decOffset === undefined)
        data.decOffset = parseInt(matches.id, 16) - firstMarker;
    // The leading zeroes are stripped when converting back to string, so we re-add them here.
    // Fortunately, we don't have to worry about whether or not this is robust,
    // since we know all the IDs that will be present in the encounter.
    return (parseInt(matches.id, 16) - data.decOffset).toString(16).toUpperCase().padStart(4, '0');
};

Options.Triggers.push(
{
    zoneId: ZoneId.TheOmegaProtocolUltimate,
    initData: () => {
        return {
            myLoopBlasterCount: 0,
            myPantoMissileCount: 0,
            mySpotlightStacks: [],
            myLatentDefectTowerRound: 0,
            myWaveCannonStacks: [],
            myOptFirePositions: { },
            myDistancesToEye: [],
            cw90FromEye: { },
            rightGroup: { },
            leftGroup: { },
            dynamisStacks: { },
            farWorldTargets: [],
            armBaitTargets: []
        };
    },
    triggers: [
    {
        id: 'MY TOP In Line Debuff',
        type: 'GainsEffect',
        netRegex: { effectId: ['BBC', 'BBD', 'BBE', 'D7B'], capture: false },
        delaySeconds: 0.5,
        durationSeconds: 5,
        suppressSeconds: 9999,
        infoText: (_data, _matches, output) => {
            return output.response();
        },
        outputStrings: {
            response: {
                en: '3\'s in',
            },
        },
    },
    {
        id: 'MY TOP Program Loop First Debuffs',
        type: 'StartsUsing',
        // 7B07 = Blaster cast (only one cast, but 4 abilities)
        netRegex: { id: '7B07', source: 'Omega', capture: false },
        infoText: (_data, _matches, output) => {
            return output.response();
        },
        outputStrings: {
            response: {
                en: '1\'s out',
            },
        },
    },
    {
        id: 'MY TOP Program Loop Other Debuffs',
        type: 'Ability',
        netRegex: { id: '7B08', source: 'Omega', capture: false },
        preRun: (data) => data.myLoopBlasterCount++,
        infoText: (data, _matches, output) => {
            const mechanicNum = data.myLoopBlasterCount + 1;
            if ( mechanicNum >= 5 )
                return;

            return output.response( { num: mechanicNum } );
        },
        outputStrings: {
            response: {
                en: '${num}\'s out',
            },
        },
    },
    {
        id: 'MY TOP Pantokrator First Debuffs',
        type: 'StartsUsing',
        // 7B0D = initial Flame Thrower cast, 7E70 = later ones
        netRegex: { id: '7B0D', source: 'Omega', capture: false },
        suppressSeconds: 1,
        infoText: (_data, _matches, output) => {
            return output.response();
        },
        outputStrings: {
            response: {
                en: '1\'s out',
            },
        },
    },
    {
        id: 'MY TOP Pantokrator Other Debuffs',
        type: 'Ability',
        // 7B0E = Guided Missile Kyrios spread damage
        netRegex: { id: '7B0E', source: 'Omega', capture: false },
        preRun: (data) => data.myPantoMissileCount++,
        suppressSeconds: 1,
        infoText: (data, _matches, output) => {
            const mechanicNum = data.myPantoMissileCount + 1;
            if ( mechanicNum >= 5 )
                return;

            return output.response( { num: mechanicNum } );
        },
        outputStrings: {
            response: {
                en: '${num}\'s out',
            },
        },
    },
    {
        id: 'MY TOP Optical Laser',
        type: 'StartsUsing',
        netRegex: { id: '7B21', source: 'Optical Unit' },
        run: (data, matches) => {
            data.cw90FromEye = { x: (200-matches.y), y: matches.x };
        },
    },
    {
        id: 'MY TOP Optimized Fire III Collector',
        type: 'Ability',
        netRegex: { id: '7B2F' },
        run: (data, matches) => {
            data.myOptFirePositions[matches.target] = { x: matches.targetX,
                                                        y: matches.targetY };

            if ( Object.keys(data.myOptFirePositions).length !== 8 )
                return;

            for ( const name in data.myOptFirePositions )
            {
                data.myDistancesToEye.push( { name: name,
                                              distance: Math.sqrt(  Math.pow((data.cw90FromEye.x - data.myOptFirePositions[name].x), 2)
                                                                  + Math.pow((data.cw90FromEye.y - data.myOptFirePositions[name].y), 2) ) } );
            }
            data.myDistancesToEye.sort((a, b) => (a.distance - b.distance));

            data.myDistancesToEye.slice( 0, 4 ).forEach( p => {
                data.rightGroup[data.synergyMarker[p.name]] = p.name;
            } );

            data.myDistancesToEye.slice( 4, 8 ).forEach( p => {
                data.leftGroup[data.synergyMarker[p.name]] = p.name;
            } );
        },
    },
    {
        id: 'MY TOP Spotlight',
        type: 'HeadMarker',
        netRegex: {},
        condition: (data, matches) => getHeadmarkerId( data, matches ) === headmarkers.stack,
        response: (data, matches, output) => {
            output.responseOutputStrings = {
                swap: {
                    en: '${p1} and ${p2} swap',
                },
                noSwap: {
                    en: "No swap"
                },
            };

            data.mySpotlightStacks.push( matches.target );
            const [p1, p2] = data.mySpotlightStacks.sort();
            if (   ( data.mySpotlightStacks.length !== 2 )
                || ( p1 === undefined )
                || ( p2 === undefined ) )
            {
                return;
            }

            var str = output.noSwap;
            var lgarr = Object.values( data.leftGroup );
            var rgarr = Object.values( data.rightGroup );
            var mark1;
            var mark2;
            var playerL;
            var playerR;

            if (   ( lgarr.includes( p1 ) )
                && ( lgarr.includes( p2 ) ) )
            {
                var marksL = Object.keys( data.leftGroup );
                mark1 = marksL.find( key => data.leftGroup[key] === p1 );
                mark2 = marksL.find( key => data.leftGroup[key] === p2 );

                if (   (   ( data.glitch === "mid" )
                        && ( markOrder[mark1] > markOrder[mark2] ) )
                    || (   ( data.glitch === "remote" )
                        && ( markOrder[mark1] < markOrder[mark2] ) ) )
                {
                    playerL = p1;
                    playerR = data.rightGroup[mark1];
                }
                else
                {
                    playerL = p2;
                    playerR = data.rightGroup[mark2];
                }
                str = output.swap( {
                        p1: data.ShortName( playerL ),
                        p2: data.ShortName( playerR ) } );
            }
            else if (   ( rgarr.includes( p1 ) )
                     && ( rgarr.includes( p2 ) ) )
            {
                var marksR = Object.keys( data.rightGroup );
                mark1 = marksR.find( key => data.rightGroup[key] === p1 );
                mark2 = marksR.find( key => data.rightGroup[key] === p2 );

                if ( markOrder[mark1] > markOrder[mark2] )
                {
                    playerL = data.leftGroup[mark1];
                    playerR = p1;
                }
                else
                {
                    playerL = data.leftGroup[mark2];
                    playerR = p2;
                }
                str = output.swap( {
                        p1: data.ShortName( playerL ),
                        p2: data.ShortName( playerR ) } );
            }
            return { alertText: str };
        },
    },
    {
        id: 'MY TOP Latent Defect Tower',
        type: 'StartsUsing',
        netRegex: { id: '7B6F', source: 'Omega', capture: false },
        preRun: (data) => data.myLatentDefectTowerRound++,
        infoText: (data, _matches, output) => {
            return output.response( { num: data.myLatentDefectTowerRound } );
        },
        outputStrings: {
            response: {
                en: 'Tower Round ${num}',
            },
        },
    },
    {
        id: 'MY TOP Wave Cannon Stack Collector',
        type: 'Ability',
        netRegex: { id: '5779', source: 'Omega' },
        run: (data, matches) => data.myWaveCannonStacks.push( matches.target ),
    },
    {
        id: 'MY TOP Wave Cannon Stack',
        type: 'Ability',
        netRegex: { id: '5779', source: 'Omega', capture: false },
        delaySeconds: 0.3,
        suppressSeconds: 1,
        response: (data, _matches, output) => {
            output.responseOutputStrings = {
                swap: {
                    en: '${p1} and ${p2} swap',
                },
                noSwap: {
                    en: "No swap",
                },
            };

            const [p1, p2] = data.myWaveCannonStacks.sort();
            if (   ( data.myWaveCannonStacks.length !== 2 )
                || ( p1 === undefined )
                || ( p2 === undefined ) )
            {
                return;
            }

            var str = output.noSwap;
            var playerL;
            var playerR;

            if (   ( waveCannonL.includes( p1 ) )
                && ( waveCannonL.includes( p2 ) ) )
            {
                playerL = waveCannonL[Math.min( waveCannonL.indexOf( p1 ),
                                                waveCannonL.indexOf( p2 ) )];
                playerR = waveCannonR[0];
                str = output.swap( {
                    p1: data.ShortName( playerL ),
                    p2: data.ShortName( playerR ) } );

            }
            else if (   ( waveCannonR.includes( p1 ) )
                     && ( waveCannonR.includes( p2 ) ) )
            {
                playerR = waveCannonR[Math.min( waveCannonR.indexOf( p1 ),
                                                waveCannonR.indexOf( p2 ) )];
                playerL = waveCannonL[0];;
                str = output.swap( {
                    p1: data.ShortName( playerL ),
                    p2: data.ShortName( playerR ) } );

            }
            return { alertText: str };
        },
        run: (data, _matches) => data.myWaveCannonStacks = [],
    },
    {
        id: 'MY TOP P5 Quickening Dynamis Collector',
        type: 'GainsEffect',
        netRegex: { effectId: 'D74' },
        run: (data, matches) => {
            if ( data.dynamisStacks[matches.target] === undefined )
                data.dynamisStacks[matches.target] = 1;
            else
                data.dynamisStacks[matches.target]++;
        },
    },
    {
        id: 'MY TOP P5 Sigma Debuffs',
        type: 'Ability',
        netRegex: { id: '7B04', capture: false },
        condition: (data) => data.phase === 'sigma',
        suppressSeconds: 5,
        response: (data, _matches, output) => {
            output.responseOutputStrings = {
                response: {
                    en: '${p1} 1, ${p2} 2, ${p3} ${p4} arms',
                },
            };

            var count = 0;
            sigmaBaitTargets.every( name => {
                if (   ( data.trioDebuff[name] === undefined )
                    && ( data.dynamisStacks[name] >= 1 ) )
                {
                    data.armBaitTargets.push( name );
                    count++;
                }
                return (count < 2);
            } );

            var count = 0;
            sigmaBaitTargets.slice().reverse().every( name => {
                if ( data.trioDebuff[name] === undefined )
                {
                    data.farWorldTargets.push( name );
                    count++;
                }
                return (count < 2);
            } );

            if (   ( data.farWorldTargets.length == 2 )
                && ( data.armBaitTargets.length == 2 ) )
            {
                return {
                    infoText: output.response( { p1: data.ShortName( data.farWorldTargets[0] ),
                                                 p2: data.ShortName( data.farWorldTargets[1] ),
                                                 p3: data.ShortName( data.armBaitTargets[0] ),
                                                 p4: data.ShortName( data.armBaitTargets[1] ) } )
                }
            }
        },
    },]
});

