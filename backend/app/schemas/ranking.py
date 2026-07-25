from pydantic import BaseModel, ConfigDict


class RankingEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    nickname: str
    full_name: str
    total_xp: int
    rank: int
