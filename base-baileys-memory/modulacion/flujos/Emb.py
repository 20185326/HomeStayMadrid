import pandas as pd
import openai
from openai.embeddings_utils import get_embedding
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import ast
import sys
def buscar(busqueda, df, n_resultados):
    busqueda_embed = get_embedding(busqueda, engine="text-embedding-ada-002")
    df["Similitud"] = df['Embedding'].apply(lambda x: cosine_similarity(np.reshape(x, (1, -1)), np.reshape(busqueda_embed, (1, -1))))
    df = df.sort_values("Similitud", ascending=False)
    return df.iloc[:n_resultados][["texto"]]

def obtenerInformacion(df,pregunta,n_resultados):#FUNCION A EXPORTAR
    openai.api_key = "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"
    informacion = buscar(pregunta, df, n_resultados)
    informacionString = '\n'.join(informacion.texto.tolist())
    return informacionString

def transformaDataFrame(archCSV):
    df = pd.read_csv(archCSV, sep='|')
    df['Embedding1'] = df['Embedding1'].apply(ast.literal_eval)
    df['Embedding2'] = df['Embedding2'].apply(ast.literal_eval)
    new_embeddings = []
    for i in range(len(df)):
        new_embedding = df['Embedding1'][i] + df['Embedding2'][i]
        new_embeddings.append(new_embedding)
    df['Embedding'] = new_embeddings
    return df.drop(['Embedding1', 'Embedding2'], axis=1)
archCSV=sys.argv[2]
df=transformaDataFrame(archCSV)
pregunta=sys.argv[1]
resultados=int(sys.argv[3])
informacion=obtenerInformacion(df,pregunta,resultados)
print(informacion)


