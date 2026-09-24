# Compliance Agent

The Compliance Agent uses two layers.

1. Deterministic checks identify required SOAP sections, diagnosis/clinical impression wording, management-plan wording and history/context.
2. Groq provides contextual completeness and clarity review when configured.

The final score is calculated in Python as rule-based points (0–70) plus LLM completeness (0–20) plus LLM clarity (0–10).

The agent does not diagnose, prescribe, assess clinical correctness, or replace clinician review.
