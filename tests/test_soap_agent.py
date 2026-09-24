from agents.soap_agent import soap_to_text

def test_soap_to_text():
    s=soap_to_text({"subjective":"Pain","objective":"BP documented","assessment":"Possible cause","plan":"Follow-up"})
    assert "Subjective:" in s and "Plan:" in s
