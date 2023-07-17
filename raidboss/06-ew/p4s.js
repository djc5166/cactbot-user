const act4PurpleOutputStrings =
{
    group:
    {
        en: '${num}: ${player}',
    },
    w: Outputs.west,
    sw: Outputs.southwest,
    a4PurpleStartDir:
    {
        en: 'Party Start: ${dir}',
    },
};

Options.Triggers.push(
    {
        id: 'AsphodelosTheFourthCircleSavage-USER',
        zoneId: ZoneId.AsphodelosTheFourthCircleSavage,
        triggers: [
        {
            id: 'P4S Act 4 Purple Tether Collect',
            type: 'Tether',
            netRegex: NetRegexes.tether({ id: '00A[CD]', source: 'Hesperos' }),
            condition: (data, matches) => data.act === '4' && data.actHeadmarkers[matches.target] === '012D',
            promise: async (data, matches) => {
                const result = await callOverlayHandler({
                    call: 'getCombatants',
                    ids: [parseInt(matches.sourceId, 16)],
                });
                const thisThorn = result.combatants[0];
                if ( !thisThorn )
                {
                  console.error(`Act 4 Tether: null data`);
                  return;
                }

                const centerX = 100;
                const centerY = 100;
                const x = thisThorn.PosX - centerX;
                const y = thisThorn.PosY - centerY;
                // Dirs: N = 0, NE = 1, ..., NW = 7
                data.thornDir = Math.round(4 - 4 * Math.atan2(x, y) / Math.PI) % 8;
                (data.purples ??= [])[parseInt(data.thornDir/2)] = matches.target;
            },
            alertText: (data, matches, output) => {
                if ( !data.a4flag )
                {
                    data.a4flag = true;
                    let dir = ((data.thornDir % 2 == 1) ? output.w() : output.sw())
                    return output.a4PurpleStartDir( { dir: dir } );
                }
            },
            outputStrings: act4PurpleOutputStrings,
        },
        {
            id: 'P4S Act 4 Purple Call 1',
            type: 'Tether',
            // Tether comes after the headmarker color.
            netRegex: NetRegexes.tether({ id: '00A[CD]', source: 'Hesperos', capture: false }),
            condition: (data, matches) => data.act === '4',
            delaySeconds: 14,
            suppressSeconds: 9999,
            alertText: (data, matches, output) => output.group( { num: 1, player: data.ShortName( data.purples[0] ) } ),
            outputStrings: act4PurpleOutputStrings,
        },
        {
            id: 'P4S Act 4 Purple Call 2',
            type: 'Tether',
            // Tether comes after the headmarker color.
            netRegex: NetRegexes.tether({ id: '00A[CD]', source: 'Hesperos', capture: false }),
            condition: (data, matches) => data.act === '4',
            delaySeconds: 20,
            suppressSeconds: 9999,
            alertText: (data, matches, output) => output.group( { num: 2, player: data.ShortName( data.purples[1] ) } ),
            outputStrings: act4PurpleOutputStrings,
        },
        {
            id: 'P4S Act 4 Purple Call 3',
            type: 'Tether',
            // Tether comes after the headmarker color.
            netRegex: NetRegexes.tether({ id: '00A[CD]', source: 'Hesperos', capture: false }),
            condition: (data, matches) => data.act === '4',
            delaySeconds: 28,
            suppressSeconds: 9999,
            alertText: (data, matches, output) => output.group( { num: 3, player: data.ShortName( data.purples[2] ) } ),
            outputStrings: act4PurpleOutputStrings,
        },
        {
            id: 'P4S Act 4 Purple Call 4',
            type: 'Tether',
            // Tether comes after the headmarker color.
            netRegex: NetRegexes.tether({ id: '00A[CD]', source: 'Hesperos', capture: false }),
            condition: (data, matches) => data.act === '4',
            delaySeconds: 33,
            suppressSeconds: 9999,
            alertText: (data, matches, output) => output.group( { num: 4, player: data.ShortName( data.purples[3] ) } ),
            outputStrings: act4PurpleOutputStrings,
        },],
    }
);

