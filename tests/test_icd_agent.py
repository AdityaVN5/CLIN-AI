from agents.icd_agent import find_candidates, suggest_icd_codes

def test_candidate_search():
    c=find_candidates("Subjective: Patient reports chest discomfort for two days.")
    assert c and c[0]["code"]=="R07.9"

def test_no_match():
    assert find_candidates("No matching demo condition.")==[]
