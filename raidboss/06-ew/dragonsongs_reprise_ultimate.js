const diveFromGraceStrings =
{
    allCircles:
    {
        en: '#${num} All Circles'
    },
    hasArrows:
    {
        en: '#${num} Has Arrows'
    },
};

const enumStrings =
{
    cloneDirStr:
    {
        en: 'Clone ${dir}',
    },
    dirN: Outputs.north,
    dirNE: Outputs.northeast,
    dirE: Outputs.east,
    dirSE: Outputs.southeast,
    dirS: Outputs.south,
    dirSW: Outputs.southwest,
    dirW: Outputs.west,
    dirNW: Outputs.northwest,
    unknown: Outputs.unknown,
};

Options.Triggers.push(
{
    id: 'DragonsongsRepriseUltimate-USER',
    zoneId: ZoneId.DragonsongsRepriseUltimate,
    timelineTriggers: [
    {
        id: 'P6 Caster LB3',
        regex: /Great Wyrmsbreath/,
        beforeSeconds: 23,
        suppressSeconds: 9999,
        infoText: (_data, _matches, output) => output.text(),
        outputStrings:
        {
            text:
            {
                en: 'Caster LB',
            },
        },
    },],
    triggers: [
    {
        id: 'DSR Dive From Grace 1',
        type: 'GainsEffect',
        netRegex: NetRegexes.gainsEffect( { effectId: ['AC3', 'AC4', 'AC5'] } ),
        delaySeconds: 0.5,
        suppressSeconds: 9999,
        alertText: ( data, _matches, output ) =>
        {
            if ( !data.diveFromGraceHasArrow[1] )
                return output.allCircles( { num: 1 } );
            else
                return output.hasArrows( { num: 1 } );
        },
        outputStrings: diveFromGraceStrings,
    },
    {
        id: 'DSR Dive From Grace 3',
        type: 'GainsEffect',
        netRegex: NetRegexes.gainsEffect( { effectId: ['AC3', 'AC4', 'AC5'] } ),
        delaySeconds: 10,
        suppressSeconds: 9999,
        alertText: ( data, _matches, output ) =>
        {
            if ( !data.diveFromGraceHasArrow[3] )
                return output.allCircles( { num: 3 } );
            else
                return output.hasArrows( { num: 3 } );
        },
        outputStrings: diveFromGraceStrings,
    },
    {
        id: 'DSR Enum Clone Tether',
        type: 'Tether',
        netRegex: NetRegexes.tether( { id: '0054', source: 'Nidhogg' } ),
        condition: ( data, matches ) => !data.cloneFound,
        promise: async ( data, matches ) =>
        {
            const result = await callOverlayHandler({
                call: 'getCombatants',
                ids: [parseInt(matches.sourceId, 16)],
            });
            const thisClone = result.combatants[0];
            if ( !thisClone )
            {
                console.error( `DSR Enum: null data` );
                return;
            }

            if ( thisClone.CurrentHP == thisClone.MaxHP )
            {
                data.cloneFound = true;
                data.enumClone = thisClone;
            }
        },
        response: ( data, matches, output ) =>
        {
            if ( !data.cloneFound )
            {
                return;
            }

            const centerX = 100;
            const centerY = 100;
            const x = data.enumClone.PosX - centerX;
            const y = data.enumClone.PosY - centerY;
            // Dirs: N = 0, NE = 1, ..., NW = 7
            const cloneDir = Math.round(4 - 4 * Math.atan2(x, y) / Math.PI) % 8;

            const dirStr =
            {
                0: output.dirN(),
                1: output.dirNE(),
                2: output.dirE(),
                3: output.dirSE(),
                4: output.dirS(),
                5: output.dirSW(),
                6: output.dirW(),
                7: output.dirNW(),
            }[cloneDir] ?? output.unknown();
            return { alertText: output.cloneDirStr( { dir: dirStr } ) };
        },
        outputStrings: enumStrings,
    },],
});