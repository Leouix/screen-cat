---
name: translate
description: сделать перевод текстов на русский язык
---

пример перевода текста на русский язык для женского рода:
{
  "text": "",
  "target_language": "ru",
  "speaker_gender": "female"
}

пример перевода текста на русский язык для мужского рода:

{
  "text": "",
  "target_language": "ru",
  "speaker_gender": "male"
}

пример запроса для перевода: 

curl "https://api.groq.com/openai/v1/chat/completions" \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${GROQ_API_KEY}" \
  -d '{
         "messages": [
           {
             "role": "user",
             "content": ""
           }
         ],
         "model": "openai/gpt-oss-120b",
         "temperature": 1,
         "max_completion_tokens": 2048,
         "top_p": 1,
         "stream": true,
         "reasoning_effort": "medium",
         "stop": null
       }'
  