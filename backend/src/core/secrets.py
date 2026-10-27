import json
from functools import lru_cache

import boto3


AWS_REGION = "ap-south-1"
SECRET_NAME = "manufacturing/dev/database"


@lru_cache(maxsize=1)
def get_database_secret() -> dict:
    client = boto3.client(
        "secretsmanager",
        region_name=AWS_REGION,
    )

    response = client.get_secret_value(
        SecretId=SECRET_NAME,
    )

    return json.loads(response["SecretString"])
