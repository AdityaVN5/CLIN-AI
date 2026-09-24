import database.db as db

def test_database_roundtrip(tmp_path):
    old=db.settings.db_path
    object.__setattr__(db.settings,"db_path",str(tmp_path/"test.db"))
    try:
        db.init_db()
        db.save_patient({"patient_id":"P1","patient_name":"Synthetic","age":30,"gender":"Other"})
        cid=db.save_consultation("P1","Patient transcript","Subjective:\nDocumented.")
        assert db.get_consultation(cid)["patient_id"]=="P1"
    finally:
        object.__setattr__(db.settings,"db_path",old)
