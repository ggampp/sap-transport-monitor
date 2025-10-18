import json
import os
import tempfile
import psycopg2

# Cole seu JSON aqui (ou carregue de um arquivo/variável de ambiente)
BTP_JSON = {
  "username": "12078877e05b",
  "password": "40bedba1039b95ea11bf5",
  "hostname": "postgres-0051ecc1-bd29-4b6e-88ad-56e61bdd0d29.cqryblsdrbcs.us-east-1.rds.amazonaws.com",
  "dbname": "IthxfFGAZuJr",
  "port": "7323",
  "uri": "postgres://12078877e05b:40bedba1039b95ea11bf5@postgres-0051ecc1-bd29-4b6e-88ad-56e61bdd0d29.cqryblsdrbcs.us-east-1.rds.amazonaws.com:7323/IthxfFGAZuJr",
  "sslrootcert": """-----BEGIN CERTIFICATE-----
MIID/zCCAuegAwIBAgIRAPVSMfFitmM5PhmbaOFoGfUwDQYJKoZIhvcNAQELBQAw
... (encurtado) ...
-----END CERTIFICATE-----"""
}

def connect_psycopg2(cfg: dict):
    # Grava o sslrootcert em um arquivo temporário
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".crt") as f:
        f.write(cfg["sslrootcert"])
        sslroot_path = f.name

    dsn = (
        f"host={cfg['hostname']} "
        f"port={cfg['port']} "
        f"dbname={cfg['dbname']} "
        f"user={cfg['username']} "
        f"password={cfg['password']} "
        f"sslmode=verify-full "
        f"sslrootcert={sslroot_path} "
        f"connect_timeout=10"
    )

    # Conecta e faz um teste simples
    conn = psycopg2.connect(dsn)
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT version(), current_database(), current_user;")
            row = cur.fetchone()
            print("version:", row[0])
            print("database:", row[1])
            print("user:", row[2])
    finally:
        conn.close()

if __name__ == "__main__":
    connect_psycopg2(BTP_JSON)
