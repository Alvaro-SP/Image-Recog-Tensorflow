import re
with open('/home/droid/Documents/Image Recog Tensorflow/ModeloTensorflow/models/research/object_detection/packages/tf2/setup.py') as f:
    s = f.read()

with open('/home/droid/Documents/Image Recog Tensorflow/ModeloTensorflow/models/research/setup.py', 'w') as f:
    # Set fine_tune_checkpoint path
    s = re.sub('tf-models-official>=2.5.1',
               'tf-models-official==2.8.0', s)
    f.write(s)