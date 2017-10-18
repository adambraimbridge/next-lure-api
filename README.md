
# next-lure-api
<img src="https://user-images.githubusercontent.com/447559/31726275-658368f2-b41e-11e7-82e7-100554b68858.png" align="right" width="400">Suggests articles and other content for a user to engage with based on context, user behaviour and other signals e.g. editorial curation

> "The great charm of fly-fishing is that we are always learning." ~ Theodore Gordon

> "There’s always a hot new fly. Precious few of these patterns are genuine breakthroughs destined to last for a hundred years, but more often they’re idle comments on existing traditions, explorations of half-baked theories, attempts to use new and interesting materials, to impress other tiers, or excuses to rename old patterns." ~ John Gierach

## Contract

### Request
- All requests may send a content uuid or concept for contextual targeting
- Requests should include feature flags and any ab tests/cohorts the user is in
- Requests may include the user uuid for more personalised targeting
- Request may specify things to exclude from the space of possible recommendations

e.g.
- /content/{uuid} 
- /content/{uuid}?user={uuid}
- /concept/{uuid}?exclude[]={uuid},exclude[]={uuid}

### Response
JSON response with the following properties. Those with * are required
- *title
- titleHref
- concept (possibly with additional data to enable features related to the concept)
- positionHint
- styling/emphasisHint
- *recommendations: array, Each item may be:
  - a json to generate a teaser
  - a json to generate an n-concept card
  - ...
  In addition, each item must contain a property, `recommendationType`, detailing what kind of thing it is the data for. Some kind of styling hint may also be useful. Each item may contain a `adviceText` property to explain to the user why it is being recommended. Each item must send data for use in tracking the reason[s] a recommendation has been shown
