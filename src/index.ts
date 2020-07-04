import {Configuration, Plugin, RuleSetRule, RuleSetUseItem} from "webpack";
import {Configuration as DevServerConfiguration} from "webpack-dev-server";

export interface ElectronRunnerConfig {
  webpack?: Configuration;
  less?: (config: RuleSetUseItem) => RuleSetUseItem;
  sass?: (config: RuleSetUseItem) => RuleSetUseItem;
  ts?: (config: RuleSetUseItem) => RuleSetUseItem[];
  overwriteLoaders?: <T extends RuleSetRule[]>(rules: T) => T;
  overwritePlugins?: <T extends Plugin[]>(plugins: T) => T;
  devServer?: DevServerConfiguration;
}
