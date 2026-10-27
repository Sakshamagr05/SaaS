from src.models.base import BaseModel


class Sample(BaseModel):
    name: str


item = Sample(name="Test Manufacturing")

print("Name:", item.name)
print("ID before database insert:", item.id)
print("Created at:", item.created_at)
print("Updated at:", item.updated_at)