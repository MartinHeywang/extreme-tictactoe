import * as model from "./model";
import * as dom from "./dom";

const success = model.loadSnapshotFromLocalStorage();
if(!success) model.resetModel();

dom.updateAll();
