import pandas as pd
import openai
from openai.embeddings_utils import get_embedding
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def crearEmbedding(documentTXT):
    with open(documentTXT, "r",encoding='utf-8') as file:
        text = file.read()
        print(text)  # Imprime el contenido de texto para verificar su contenido
        chunk = text.split("==")
    df = pd.DataFrame(chunk,columns=["texto"])
    print("Entre")
    df['Embedding'] = df["texto"].apply(lambda x: get_embedding(x, engine='text-embedding-ada-002'))
    print("Pase")
    # Dividir la columna "Embedding" en dos columnas
    df['Embedding1'] = df['Embedding'].apply(lambda x: x[:int(len(df.Embedding[0])/2)])
    df['Embedding2'] = df['Embedding'].apply(lambda x: x[int(len(df.Embedding[0])/2):])
    df.drop('Embedding', axis=1, inplace=True)
    return df

def crearDataFrame(nomArch):
    documentTXT=nomArch+".txt"
    openai.api_key = "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"
    df = crearEmbedding(documentTXT)
    documentCSV=nomArch+".csv"
    df.to_csv(documentCSV, sep='|',index=False)
    return df
nombArch="EmbVC58_Video"
crearDataFrame(nombArch)
