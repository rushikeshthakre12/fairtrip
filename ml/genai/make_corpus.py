"""
Builds ml/genai/corpus_taxi.txt — a SYNTHETIC corpus of short taxi/travel note
phrases, generated from templates so it is deterministic (seed 42).

It is demo data for the CBOW next-word model. The suggestions will be good for
taxi-note phrasing and weak for general English. Say so in your presentation.
"""
import random

random.seed(42)

OPENERS = [
    "the driver", "the auto driver", "the cab driver", "the taxi driver", "we", "i", "my friend",
    "the prepaid counter", "the app cab", "the local driver",
]
VERBS = [
    "asked for", "quoted", "agreed to", "refused to", "insisted on", "wanted", "offered",
    "charged", "demanded", "accepted",
]
OBJECTS = [
    "an extra fare", "the meter", "a fixed price", "double the usual fare", "cash only",
    "a night surcharge", "toll charges", "waiting charges", "the full amount in advance",
    "a discount", "a higher rate",
]
PLACES = [
    "the airport", "the railway station", "the bus stand", "the city centre", "the hotel",
    "the beach", "the market", "the bridge", "the mall", "the old town",
]
TEMPLATES = [
    "prepaid taxi counter at the {p}",
    "prepaid auto counter at the {p}",
    "meter was not working so we negotiated the fare near {p}",
    "fare from {p} to the hotel was {n} rupees",
    "night surcharge applied after 10 pm from {p}",
    "toll charges paid by the passenger from {p}",
    "ride booked on the app from {p} was cheaper",
    "sedan taxi from {p} took about {n} minutes in traffic",
    "hatchback auto from {p} with a fixed fare of {n} rupees",
    "suv cab from {p} charged extra for luggage",
    "waiting charges added at {p} for twenty minutes",
    "driver refused the meter at {p} and asked for cash",
    "fare confirmed before the trip from {p} for {n} rupees",
    "receipt received after the trip from {p}",
    "fare was fair for the distance from {p} at this time",
    "bargained the price down near {p} in the evening",
    "app cab from {p} surge pricing at peak hours",
    "airport pickup from {p} included a prepaid fare",
]


def sentence():
    if random.random() < 0.5:
        t = random.choice(TEMPLATES)
        return t.format(p=random.choice(PLACES), n=random.choice([80, 120, 150, 200, 250, 300, 400, 500, 650, 900]))
    return f"{random.choice(OPENERS)} {random.choice(VERBS)} {random.choice(OBJECTS)} near {random.choice(PLACES)}"


if __name__ == "__main__":
    lines = sorted({sentence() for _ in range(2600)})
    random.shuffle(lines)
    with open("corpus_taxi.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"wrote {len(lines)} synthetic phrases -> corpus_taxi.txt")
