SELECT 'CREATE DATABASE postgres'
WHERE NOT EXISTS (SELECT FROM postgres WHERE datname = 'postgres')\gexec 
