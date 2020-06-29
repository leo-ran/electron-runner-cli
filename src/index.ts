import {Configuration, RuleSetUseItem} from "webpack";
import {Configuration as DevServerConfiguration} from "webpack-dev-server";

export interface ElectronRunnerConfig {
  webpack?: Configuration;
  less?: (config: RuleSetUseItem) => RuleSetUseItem;
  sass?: (config: RuleSetUseItem) => RuleSetUseItem;
  devServer?: DevServerConfiguration;
}
