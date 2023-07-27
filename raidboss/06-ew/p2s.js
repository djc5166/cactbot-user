const harmaMarkers = [
  '0095',
  '0098',
];

Options.Triggers.push(
{
  id: 'AsphodelosTheSecondCircleSavage-USER',
  zoneId: ZoneId.AsphodelosTheSecondCircleSavage,
  triggers: [
    {
      id: 'P2S Kampeos Harma Marker Collect',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker(),
      condition: (data, matches) => { return harmaMarkers.includes((parseInt(matches.id, 16) - data.decOffset).toString(16).toUpperCase().padStart(4, '0')); },
      run: (data, matches) => (data.marks ??= []).push(matches),
    },
    {
      id: 'P2S Kampeos Harma Marker',
      type: 'HeadMarker',
      netRegex: NetRegexes.headMarker({ capture: false }),
      delaySeconds: (data) => data.marks?.length >= 2 ? 0 : 0.5,
      response: (data, _matches, output) => {
        output.responseOutputStrings = {
          marks: {
            en: 'Marks: ${player1}, ${player2}',
          },
          unknown: Outputs.unknown
        };

        if (data.marks === undefined)
          return;

        const markText = output.marks({ player1: data.ShortName(data.marks[0].target),
                                        player2: data.ShortName(data.marks[1].target) });
        return {
          infoText: markText,
          tts: markText
        };
      },
      run: (data) => delete data.marks
    },],
  }
);

