#!/usr/bin/env python3
"""Generate 3 sample Sora 2 videos for MEDVET Integrativa."""
import os, sys
sys.path.insert(0, os.path.abspath(''))
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')
from emergentintegrations.llm.openai.video_generation import OpenAIVideoGeneration

VIDEOS = [
    {
        "name": "acupuntura",
        "prompt": "A gentle female veterinarian with blonde wavy hair in a clean modern veterinary clinic performing acupuncture treatment on a calm golden retriever dog lying on a treatment table. Soft natural lighting, professional medical setting, close-up of the acupuncture needles being carefully placed. Warm and caring atmosphere. 4K cinematic quality.",
        "file": "/app/backend/static/videos/acupuntura.mp4"
    },
    {
        "name": "fitoterapia",
        "prompt": "Beautiful arrangement of medicinal herbs and dried plants on a wooden table in a veterinary holistic clinic. A female veterinarian with blonde hair carefully preparing an herbal remedy in a mortar and pestle while a small dog watches curiously. Warm golden lighting, natural and organic aesthetic. 4K cinematic quality.",
        "file": "/app/backend/static/videos/fitoterapia.mp4"
    },
    {
        "name": "bem-estar",
        "prompt": "A happy golden retriever dog running in slow motion through a green meadow with flowers, then lying down peacefully getting a gentle massage from a female veterinarian. Soft golden hour sunlight, peaceful nature setting. Wellness and holistic veterinary care concept. 4K cinematic quality.",
        "file": "/app/backend/static/videos/bem-estar.mp4"
    },
]

for v in VIDEOS:
    print(f"Generating: {v['name']}...")
    try:
        gen = OpenAIVideoGeneration(api_key=os.environ['EMERGENT_LLM_KEY'])
        video_bytes = gen.text_to_video(
            prompt=v['prompt'],
            model="sora-2",
            size="1024x1792",
            duration=4,
            max_wait_time=600
        )
        if video_bytes:
            gen.save_video(video_bytes, v['file'])
            print(f"  OK: {v['file']}")
        else:
            print(f"  FAIL: No bytes returned")
    except Exception as e:
        print(f"  ERROR: {e}")

print("Done!")
